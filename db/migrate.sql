-- Migration: relax transactions.type CHECK + add shipping tables with full status set
-- Uses the SQLite temp-rename trick. Each block is idempotent (safe to re-run).

-- ── 1. Relax transactions.type CHECK ──────────────────────────
CREATE TABLE IF NOT EXISTS transactions_new (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(user_id),
  type           TEXT    NOT NULL,
  amount         REAL    NOT NULL,
  toy_id         INTEGER REFERENCES toys(toy_id),
  inventory_id   INTEGER REFERENCES user_inventory(inventory_id),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO transactions_new SELECT * FROM transactions;
DROP TABLE transactions;
ALTER TABLE transactions_new RENAME TO transactions;

-- ── 2. Recreate shipments without restrictive status CHECK ─────
--       (supports: processing | shipped | delivering | delivered)

CREATE TABLE IF NOT EXISTS shipments_new (
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
INSERT OR IGNORE INTO shipments_new SELECT * FROM shipments;
DROP TABLE IF EXISTS shipments;
ALTER TABLE shipments_new RENAME TO shipments;

-- ── 3. Recreate shipment_items (preserves FK to new shipments) ─
CREATE TABLE IF NOT EXISTS shipment_items_new (
  shipment_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id      INTEGER NOT NULL REFERENCES shipments(shipment_id),
  inventory_id     INTEGER NOT NULL REFERENCES user_inventory(inventory_id),
  UNIQUE(inventory_id)
);
INSERT OR IGNORE INTO shipment_items_new SELECT * FROM shipment_items;
DROP TABLE IF EXISTS shipment_items;
ALTER TABLE shipment_items_new RENAME TO shipment_items;
