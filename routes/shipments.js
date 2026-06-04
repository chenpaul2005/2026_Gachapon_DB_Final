const express     = require('express');
const getDb       = require('../lib/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const FEE_HOME         = 90;
const FEE_CONVENIENCE  = 60;
const CONVENIENCE_LIMIT = 20; // items per package before doubling

// GET /api/shipments — list all shipments for current user
router.get('/', requireAuth, (req, res) => {
  const db     = getDb();
  const userId = req.session.userId;

  const shipments = db.prepare(`
    SELECT s.*,
           COUNT(si.shipment_item_id) AS item_count
    FROM shipments s
    LEFT JOIN shipment_items si ON si.shipment_id = s.shipment_id
    WHERE s.user_id = ?
    GROUP BY s.shipment_id
    ORDER BY s.created_at DESC
  `).all(userId);

  res.json(shipments);
});

// GET /api/shipments/:id — detail of one shipment with all items
router.get('/:id', requireAuth, (req, res) => {
  const db         = getDb();
  const userId     = req.session.userId;
  const shipmentId = Number(req.params.id);

  const shipment = db.prepare(
    'SELECT * FROM shipments WHERE shipment_id = ? AND user_id = ?'
  ).get(shipmentId, userId);
  if (!shipment) return res.status(404).json({ error: '找不到此出貨單' });

  const items = db.prepare(`
    SELECT si.shipment_item_id, ui.inventory_id,
           t.name, t.rarity, t.price, t.image_url,
           m.name AS machine_name
    FROM shipment_items si
    JOIN user_inventory ui ON ui.inventory_id = si.inventory_id
    JOIN toys            t  ON t.toy_id        = ui.toy_id
    JOIN machines        m  ON m.machine_id    = t.machine_id
    WHERE si.shipment_id = ?
    ORDER BY si.shipment_item_id
  `).all(shipmentId);

  res.json({ ...shipment, items });
});

// POST /api/shipments — create a new shipment
router.post('/', requireAuth, (req, res) => {
  const db     = getDb();
  const userId = req.session.userId;

  const {
    inventory_ids,   // array of inventory_id integers
    shipping_type,   // 'home' | 'convenience'
    address,
    payment_method,  // 'balance' | 'credit_card'
    // credit card fields (only validated for presence — no real processing)
    card_number,
    card_expiry,
    card_cvv,
  } = req.body;

  // ── Basic validation ────────────────────────────────────────
  if (!Array.isArray(inventory_ids) || inventory_ids.length === 0) {
    return res.status(400).json({ error: '請至少選擇一件公仔' });
  }
  if (!['home', 'convenience'].includes(shipping_type)) {
    return res.status(400).json({ error: '無效的寄送方式' });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: '請填寫寄送地址' });
  }
  if (!['balance', 'credit_card'].includes(payment_method)) {
    return res.status(400).json({ error: '無效的付款方式' });
  }
  if (payment_method === 'credit_card') {
    if (!card_number || !card_expiry || !card_cvv) {
      return res.status(400).json({ error: '請填寫完整的信用卡資訊' });
    }
  }

  // ── Verify each inventory item belongs to user and is available ──
  const ids = inventory_ids.map(Number);
  for (const invId of ids) {
    const item = db.prepare(
      'SELECT user_id, status FROM user_inventory WHERE inventory_id = ?'
    ).get(invId);
    if (!item) {
      return res.status(404).json({ error: `找不到背包物品 #${invId}` });
    }
    if (item.user_id !== userId) {
      return res.status(403).json({ error: `物品 #${invId} 不屬於您` });
    }
    if (item.status !== 'owned') {
      return res.status(409).json({ error: `物品 #${invId} 已售出，無法出貨` });
    }
    // Check not already in another shipment
    const alreadyShipped = db.prepare(
      'SELECT 1 FROM shipment_items WHERE inventory_id = ?'
    ).get(invId);
    if (alreadyShipped) {
      return res.status(409).json({ error: `物品 #${invId} 已在出貨中` });
    }
  }

  // ── Calculate fee ───────────────────────────────────────────
  const itemCount = ids.length;
  let baseFee     = shipping_type === 'home' ? FEE_HOME : FEE_CONVENIENCE;
  let packageCount = 1;

  if (shipping_type === 'convenience' && itemCount > CONVENIENCE_LIMIT) {
    baseFee      = FEE_CONVENIENCE * 2;
    packageCount = 2;
  }

  // ── Payment ─────────────────────────────────────────────────
  if (payment_method === 'balance') {
    const user = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);
    if (user.balance < baseFee) {
      return res.status(402).json({ error: `餘額不足（需要 ${baseFee} 元），請先儲值或改用信用卡付款` });
    }
  }

  // ── Commit everything in one transaction ────────────────────
  const doShip = db.transaction(() => {
    // Deduct from balance if needed
    if (payment_method === 'balance') {
      db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?')
        .run(baseFee, userId);
      db.prepare(
        'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)'
      ).run(userId, 'shipping', -baseFee);
    }

    // Create shipment record
    const result = db.prepare(`
      INSERT INTO shipments (user_id, shipping_type, address, fee, package_count, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, shipping_type, address.trim(), baseFee, packageCount, payment_method);

    const shipmentId = result.lastInsertRowid;

    // Link each inventory item
    const insertItem = db.prepare(
      'INSERT INTO shipment_items (shipment_id, inventory_id) VALUES (?, ?)'
    );
    for (const invId of ids) {
      insertItem.run(shipmentId, invId);
    }

    const newBalance = payment_method === 'balance'
      ? db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance
      : null;

    return { shipmentId, newBalance };
  });

  const { shipmentId, newBalance } = doShip();

  res.status(201).json({
    message: `出貨單已建立！共 ${itemCount} 件，運費 ${baseFee} 元`,
    shipment_id: shipmentId,
    fee: baseFee,
    package_count: packageCount,
    balance: newBalance,
  });
});

module.exports = router;
