PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  balance       REAL    NOT NULL DEFAULT 0,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS machines (
  machine_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  pull_price  REAL    NOT NULL,
  image_url   TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS toys (
  toy_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id  INTEGER NOT NULL REFERENCES machines(machine_id),
  name        TEXT    NOT NULL,
  rarity      TEXT    NOT NULL CHECK(rarity IN ('普通','稀有','史詩','傳說')),
  price       REAL    NOT NULL,
  image_url   TEXT    NOT NULL DEFAULT '',
  weight      INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS user_inventory (
  inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(user_id),
  toy_id       INTEGER NOT NULL REFERENCES toys(toy_id),
  status       TEXT    NOT NULL DEFAULT 'owned' CHECK(status IN ('owned','sold')),
  obtained_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(user_id),
  type           TEXT    NOT NULL CHECK(type IN ('deposit','pull','sell','shipping')),
  amount         REAL    NOT NULL,
  toy_id         INTEGER REFERENCES toys(toy_id),
  inventory_id   INTEGER REFERENCES user_inventory(inventory_id),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shipments (
  shipment_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(user_id),
  shipping_type  TEXT    NOT NULL CHECK(shipping_type IN ('home','convenience')),
  address        TEXT    NOT NULL,
  fee            REAL    NOT NULL,
  package_count  INTEGER NOT NULL DEFAULT 1,
  payment_method TEXT    NOT NULL CHECK(payment_method IN ('balance','credit_card')),
  status         TEXT    NOT NULL DEFAULT 'processing',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shipment_items (
  shipment_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id      INTEGER NOT NULL REFERENCES shipments(shipment_id),
  inventory_id     INTEGER NOT NULL REFERENCES user_inventory(inventory_id),
  UNIQUE(inventory_id)
);
