const express     = require('express');
const getDb       = require('../lib/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/machines
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const machines = db.prepare('SELECT * FROM machines ORDER BY machine_id').all();
  res.json(machines);
});

// GET /api/machines/:id
router.get('/:id', requireAuth, (req, res) => {
  const db      = getDb();
  const machine = db.prepare('SELECT * FROM machines WHERE machine_id = ?').get(req.params.id);
  if (!machine) return res.status(404).json({ error: '找不到此機台' });
  const toys = db.prepare(
    'SELECT toy_id, name, rarity, price, image_url FROM toys WHERE machine_id = ? ORDER BY weight DESC'
  ).all(req.params.id);
  res.json({ machine, toys });
});

// POST /api/machines/:id/pull — weighted random pull, server-side
router.post('/:id/pull', requireAuth, (req, res) => {
  const db      = getDb();
  const userId  = req.session.userId;
  const machineId = Number(req.params.id);

  const machine = db.prepare('SELECT * FROM machines WHERE machine_id = ?').get(machineId);
  if (!machine) return res.status(404).json({ error: '找不到此機台' });

  const user = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);
  if (user.balance < machine.pull_price) {
    return res.status(402).json({ error: '餘額不足，請先儲值' });
  }

  const toys = db.prepare('SELECT * FROM toys WHERE machine_id = ?').all(machineId);
  if (toys.length === 0) return res.status(500).json({ error: '此機台尚無商品' });

  // Weighted random selection
  const totalWeight = toys.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * totalWeight;
  let won  = toys[toys.length - 1];
  for (const toy of toys) {
    roll -= toy.weight;
    if (roll <= 0) { won = toy; break; }
  }

  const doPull = db.transaction(() => {
    db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?')
      .run(machine.pull_price, userId);

    const inv = db.prepare(
      'INSERT INTO user_inventory (user_id, toy_id) VALUES (?, ?)'
    ).run(userId, won.toy_id);

    db.prepare(
      'INSERT INTO transactions (user_id, type, amount, toy_id, inventory_id) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'pull', -machine.pull_price, won.toy_id, inv.lastInsertRowid);

    const newBalance = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;
    return { inventoryId: inv.lastInsertRowid, newBalance };
  });

  const { inventoryId, newBalance } = doPull();

  res.json({
    toy: {
      toy_id:    won.toy_id,
      name:      won.name,
      rarity:    won.rarity,
      price:     won.price,
      image_url: won.image_url,
    },
    inventory_id: inventoryId,
    balance: newBalance,
  });
});

module.exports = router;
