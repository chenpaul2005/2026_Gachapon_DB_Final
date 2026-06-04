const express = require('express');
const bcrypt  = require('bcrypt');
const getDb   = require('../lib/db');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '請填寫帳號與密碼' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '帳號長度需在 2–20 字元之間' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: '密碼至少需要 4 個字元' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT user_id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: '此帳號名稱已被使用' });
  }

  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, hash);

  req.session.userId   = result.lastInsertRowid;
  req.session.username = username;
  res.status(201).json({ message: '註冊成功', username });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '請填寫帳號與密碼' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  req.session.userId   = user.user_id;
  req.session.username = user.username;
  res.json({ message: '登入成功', username: user.username });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: '已登出' });
  });
});

module.exports = router;
