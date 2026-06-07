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

-- ── 4. Stock image URLs (local assets in public/images/) ───────
UPDATE machines SET image_url = '/images/machines/classic.jpg'  WHERE name = '經典扭蛋';
UPDATE machines SET image_url = '/images/machines/limited.jpg'  WHERE name = '限定聯名';
UPDATE machines SET image_url = '/images/machines/premium.jpg'  WHERE name = '稀有收藏';

UPDATE toys SET image_url = '/images/toys/m1-panda.jpg'      WHERE machine_id = 1 AND name = '小熊貓公仔';
UPDATE toys SET image_url = '/images/toys/m1-cat.jpg'        WHERE machine_id = 1 AND name = '花貓咪公仔';
UPDATE toys SET image_url = '/images/toys/m1-penguin.jpg'    WHERE machine_id = 1 AND name = '小企鵝公仔';
UPDATE toys SET image_url = '/images/toys/m1-rabbit.jpg'     WHERE machine_id = 1 AND name = '兔兔公仔';
UPDATE toys SET image_url = '/images/toys/m1-dino.jpg'       WHERE machine_id = 1 AND name = '小恐龍公仔';
UPDATE toys SET image_url = '/images/toys/m1-unicorn.jpg'    WHERE machine_id = 1 AND name = '彩虹獨角獸';
UPDATE toys SET image_url = '/images/toys/m1-lucky-cat.jpg'  WHERE machine_id = 1 AND name = '黃金招財貓';

UPDATE toys SET image_url = '/images/toys/m2-bear-a.jpg'       WHERE machine_id = 2 AND name = '聯名小熊A';
UPDATE toys SET image_url = '/images/toys/m2-bear-b.jpg'       WHERE machine_id = 2 AND name = '聯名小熊B';
UPDATE toys SET image_url = '/images/toys/m2-cat.jpg'          WHERE machine_id = 2 AND name = '聯名小貓C';
UPDATE toys SET image_url = '/images/toys/m2-magical-girl.jpg' WHERE machine_id = 2 AND name = '限定魔法少女';
UPDATE toys SET image_url = '/images/toys/m2-robot.jpg'        WHERE machine_id = 2 AND name = '限定機器人';
UPDATE toys SET image_url = '/images/toys/m2-dragon.jpg'       WHERE machine_id = 2 AND name = '聯名龍年特別版';
UPDATE toys SET image_url = '/images/toys/m2-collector.jpg'    WHERE machine_id = 2 AND name = '聯名初回典藏版';

UPDATE toys SET image_url = '/images/toys/m3-wolf.jpg'         WHERE machine_id = 3 AND name = '水晶小狼';
UPDATE toys SET image_url = '/images/toys/m3-starry-cat.jpg'   WHERE machine_id = 3 AND name = '星空貓咪';
UPDATE toys SET image_url = '/images/toys/m3-white-rabbit.jpg' WHERE machine_id = 3 AND name = '雪白兔兔';
UPDATE toys SET image_url = '/images/toys/m3-butterfly.jpg'    WHERE machine_id = 3 AND name = '霓虹蝴蝶';
UPDATE toys SET image_url = '/images/toys/m3-phoenix.jpg'      WHERE machine_id = 3 AND name = '夢幻鳳凰';
UPDATE toys SET image_url = '/images/toys/m3-dragon.jpg'       WHERE machine_id = 3 AND name = '神龍限量版';
UPDATE toys SET image_url = '/images/toys/m3-holy-beast.jpg'   WHERE machine_id = 3 AND name = '奧義聖獸';
UPDATE toys SET image_url = '/images/toys/m3-chaos.jpg'        WHERE machine_id = 3 AND name = '混沌起源典藏';
