const express     = require('express');
const getDb       = require('../lib/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/wallet — balance + recent transactions
router.get('/', requireAuth, (req, res) => {
  const db     = getDb();
  const userId = req.session.userId;

  const user = db.prepare('SELECT user_id, username, balance FROM users WHERE user_id = ?').get(userId);
  const txs  = db.prepare(`
    SELECT t.transaction_id, t.type, t.amount, t.created_at,
           toy.name AS toy_name, toy.rarity AS toy_rarity
    FROM transactions t
    LEFT JOIN toys toy ON toy.toy_id = t.toy_id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT 50
  `).all(userId);

  res.json({ user, transactions: txs });
});

// POST /api/deposit
router.post('/deposit', requireAuth, (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: '儲值金額必須大於 0' });
  }
  if (amount > 1_000_000) {
    return res.status(400).json({ error: '單次儲值上限為 1,000,000' });
  }

  const db     = getDb();
  const userId = req.session.userId;

  const deposit = db.transaction(() => {
    db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, userId);
    db.prepare(
      'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)'
    ).run(userId, 'deposit', amount);
    return db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);
  });

  const { balance } = deposit();
  res.json({ message: '儲值成功', balance });
});

module.exports = router;
