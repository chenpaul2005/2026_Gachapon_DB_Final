const express  = require('express');
const session  = require('express-session');
const path     = require('path');

const authRoutes      = require('./routes/auth');
const walletRoutes    = require('./routes/wallet');
const machinesRoutes  = require('./routes/machines');
const inventoryRoutes = require('./routes/inventory');
const shipmentsRoutes = require('./routes/shipments');
const adminRoutes     = require('./routes/admin');
const requireAuth     = require('./middleware/requireAuth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'gachapon-dev-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge:   24 * 60 * 60 * 1000, // 1 day
  },
}));

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/wallet',    walletRoutes);
app.use('/api/machines',  machinesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/admin',     adminRoutes);

// GET /api/me — current user info for all pages
app.get('/api/me', requireAuth, (req, res) => {
  const getDb = require('./lib/db');
  const db    = getDb();
  const user  = db.prepare(
    'SELECT user_id, username, balance, is_admin FROM users WHERE user_id = ?'
  ).get(req.session.userId);
  if (!user) return res.status(404).json({ error: '使用者不存在' });
  res.json(user);
});

// Fallback: serve index.html for all non-API routes (SPA-style)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎰 扭蛋樂園已啟動！請開啟 http://localhost:${PORT}`);
});
