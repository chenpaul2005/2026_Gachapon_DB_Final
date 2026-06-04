const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'gachapon.db');
const SCHEMA  = path.join(__dirname, 'schema.sql');
const SEED    = path.join(__dirname, 'seed.sql');
const MIGRATE = path.join(__dirname, 'migrate.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(SCHEMA, 'utf8'));
db.exec(fs.readFileSync(MIGRATE, 'utf8'));

// Only seed if machines table is empty
const count = db.prepare('SELECT COUNT(*) AS c FROM machines').get().c;
if (count === 0) {
  db.exec(fs.readFileSync(SEED, 'utf8'));
  console.log('✅ Database seeded successfully.');
} else {
  console.log('ℹ️  Database already seeded, skipping.');
}

db.close();
console.log('✅ Database initialised at', DB_PATH);
