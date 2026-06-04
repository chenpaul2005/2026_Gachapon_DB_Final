const Database = require('better-sqlite3');
const bcrypt   = require('bcrypt');
const fs       = require('fs');
const path     = require('path');

const DB_PATH  = path.join(__dirname, '..', 'db', 'gachapon.db');
const MIGRATE  = path.join(__dirname, '..', 'db', 'migrate.sql');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function ensureAdminUser(db) {
  const admin = db.prepare(
    'SELECT user_id, is_admin FROM users WHERE username = ?'
  ).get(ADMIN_USERNAME);

  if (!admin) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.prepare(
      'INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)'
    ).run(ADMIN_USERNAME, hash);
    return;
  }

  if (!admin.is_admin) {
    db.prepare('UPDATE users SET is_admin = 1 WHERE user_id = ?').run(admin.user_id);
  }
}

let _db;
function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');

    _db.pragma('foreign_keys = OFF');
    _db.exec(fs.readFileSync(MIGRATE, 'utf8'));

    const hasAdminCol = _db.prepare(
      "SELECT COUNT(*) AS c FROM pragma_table_info('users') WHERE name = 'is_admin'"
    ).get().c;
    if (hasAdminCol === 0) {
      _db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
    }

    ensureAdminUser(_db);
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

module.exports = getDb;
