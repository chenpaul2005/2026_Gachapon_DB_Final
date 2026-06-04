const express      = require('express');
const getDb        = require('../lib/db');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

const VALID_STATUSES = ['processing', 'shipped', 'delivering', 'delivered'];

router.use(requireAdmin);

// GET /api/admin/users — all users with balance and inventory counts
router.get('/users', (req, res) => {
  const db = getDb();

  const users = db.prepare(`
    SELECT u.user_id, u.username, u.balance, u.is_admin, u.created_at,
           COUNT(CASE WHEN ui.status = 'owned' THEN 1 END) AS owned_count,
           COUNT(CASE WHEN ui.status = 'sold' THEN 1 END) AS sold_count
    FROM users u
    LEFT JOIN user_inventory ui ON ui.user_id = u.user_id
    GROUP BY u.user_id
    ORDER BY u.user_id
  `).all();

  res.json(users);
});

// GET /api/admin/users/:id/inventory — one user's owned inventory
router.get('/users/:id/inventory', (req, res) => {
  const db     = getDb();
  const userId = Number(req.params.id);

  const user = db.prepare(
    'SELECT user_id, username FROM users WHERE user_id = ?'
  ).get(userId);
  if (!user) return res.status(404).json({ error: '找不到此使用者' });

  const items = db.prepare(`
    SELECT ui.inventory_id, ui.status, ui.obtained_at,
           t.toy_id, t.name, t.rarity, t.price, t.image_url,
           m.name AS machine_name,
           si.shipment_id
    FROM user_inventory ui
    JOIN toys     t ON t.toy_id     = ui.toy_id
    JOIN machines m ON m.machine_id = t.machine_id
    LEFT JOIN shipment_items si ON si.inventory_id = ui.inventory_id
    WHERE ui.user_id = ?
    ORDER BY ui.obtained_at DESC
  `).all(userId);

  res.json({ user, items });
});

// GET /api/admin/shipments — all shipments across users
router.get('/shipments', (req, res) => {
  const db = getDb();

  const shipments = db.prepare(`
    SELECT s.*,
           u.username,
           COUNT(si.shipment_item_id) AS item_count
    FROM shipments s
    JOIN users u ON u.user_id = s.user_id
    LEFT JOIN shipment_items si ON si.shipment_id = s.shipment_id
    GROUP BY s.shipment_id
    ORDER BY s.created_at DESC
  `).all();

  res.json(shipments);
});

// GET /api/admin/shipments/:id — shipment detail with items
router.get('/shipments/:id', (req, res) => {
  const db         = getDb();
  const shipmentId = Number(req.params.id);

  const shipment = db.prepare(`
    SELECT s.*, u.username
    FROM shipments s
    JOIN users u ON u.user_id = s.user_id
    WHERE s.shipment_id = ?
  `).get(shipmentId);
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

// PATCH /api/admin/shipments/:id/status — update shipment status
router.patch('/shipments/:id/status', (req, res) => {
  const db         = getDb();
  const shipmentId = Number(req.params.id);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: '無效的出貨狀態' });
  }

  const shipment = db.prepare(
    'SELECT shipment_id, status FROM shipments WHERE shipment_id = ?'
  ).get(shipmentId);
  if (!shipment) return res.status(404).json({ error: '找不到此出貨單' });

  db.prepare('UPDATE shipments SET status = ? WHERE shipment_id = ?')
    .run(status, shipmentId);

  res.json({
    message: '出貨狀態已更新',
    shipment_id: shipmentId,
    status,
  });
});

module.exports = router;
