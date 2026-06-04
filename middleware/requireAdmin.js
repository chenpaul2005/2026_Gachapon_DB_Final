const getDb = require('../lib/db');

module.exports = function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: '請先登入' });
  }

  const user = getDb().prepare(
    'SELECT is_admin FROM users WHERE user_id = ?'
  ).get(req.session.userId);

  if (!user || !user.is_admin) {
    return res.status(403).json({ error: '需要管理員權限' });
  }

  next();
};
