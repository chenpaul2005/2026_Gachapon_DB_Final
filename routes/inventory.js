const express     = require('express');
const getDb       = require('../lib/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/inventory — user's owned toys with toy details
router.get('/', requireAuth, (req, res) => {
  const db     = getDb();
  const userId = req.session.userId;

  const items = db.prepare(`
    SELECT ui.inventory_id, t.toy_id, t.name, t.rarity, t.price,
           t.image_url, ui.obtained_at, ui.status,
           m.name AS machine_name,
           si.shipment_id
    FROM user_inventory ui
    JOIN toys     t  ON t.toy_id      = ui.toy_id
    JOIN machines m  ON m.machine_id  = t.machine_id
    LEFT JOIN shipment_items si ON si.inventory_id = ui.inventory_id
    WHERE ui.user_id = ? AND ui.status = 'owned'
    ORDER BY ui.obtained_at DESC
  `).all(userId);

  res.json(items);
});

// POST /api/inventory/:id/sell — sell at 60% of toy price
router.post('/:id/sell', requireAuth, (req, res) => {
  const db          = getDb();
  const userId      = req.session.userId;
  const inventoryId = Number(req.params.id);

  const item = db.prepare(`
    SELECT ui.inventory_id, ui.user_id, ui.status, t.price, t.name
    FROM user_inventory ui
    JOIN toys t ON t.toy_id = ui.toy_id
    WHERE ui.inventory_id = ?
  `).get(inventoryId);

  if (!item) return res.status(404).json({ error: '找不到此物品' });
  if (item.user_id !== userId) return res.status(403).json({ error: '這不是你的物品' });
  if (item.status === 'sold') return res.status(409).json({ error: '此物品已賣出' });

  // Block selling items that are already in a shipment
  const inShipment = db.prepare(
    'SELECT 1 FROM shipment_items WHERE inventory_id = ?'
  ).get(inventoryId);
  if (inShipment) return res.status(409).json({ error: '此物品已出貨，無法賣出' });

  const sellPrice = Math.round(item.price * 0.6 * 100) / 100;

  const doSell = db.transaction(() => {
    db.prepare("UPDATE user_inventory SET status = 'sold' WHERE inventory_id = ?")
      .run(inventoryId);
    db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?')
      .run(sellPrice, userId);
    db.prepare(
      'INSERT INTO transactions (user_id, type, amount, inventory_id) VALUES (?, ?, ?, ?)'
    ).run(userId, 'sell', sellPrice, inventoryId);

    return db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;
  });

  const newBalance = doSell();
  res.json({ message: `已賣出「${item.name}」，獲得 ${sellPrice} 元`, balance: newBalance });
});

module.exports = router;
