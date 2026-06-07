-- ============================================================
-- Machines
-- Stock images: Unsplash (gachapon vending machines)
-- ============================================================
INSERT INTO machines (name, description, pull_price, image_url) VALUES
  ('經典扭蛋', '最受歡迎的入門款扭蛋，收錄多款可愛角色公仔，每次只要 50 元！', 50,
   '/images/machines/classic.jpg'),
  ('限定聯名', '與知名動漫IP聯名合作的限定款，稀有度更高，值得收藏！', 120,
   '/images/machines/limited.jpg'),
  ('稀有收藏', '頂級收藏系列，傳說等級出率提升，是資深玩家的首選！', 200,
   '/images/machines/premium.jpg');

-- ============================================================
-- Machine 1 — 經典扭蛋 (machine_id = 1)
-- Stock images: Pexels / Antoni Shkraba Studio (pastel plush)
-- ============================================================
INSERT INTO toys (machine_id, name, rarity, price, image_url, weight) VALUES
  (1, '小熊貓公仔',   '普通', 80,  '/images/toys/m1-panda.jpg',      45),
  (1, '花貓咪公仔',   '普通', 80,  '/images/toys/m1-cat.jpg',        40),
  (1, '小企鵝公仔',   '普通', 80,  '/images/toys/m1-penguin.jpg',    35),
  (1, '兔兔公仔',     '稀有', 150, '/images/toys/m1-rabbit.jpg',     25),
  (1, '小恐龍公仔',   '稀有', 160, '/images/toys/m1-dino.jpg',       20),
  (1, '彩虹獨角獸',   '史詩', 300, '/images/toys/m1-unicorn.jpg',    10),
  (1, '黃金招財貓',   '傳說', 500, '/images/toys/m1-lucky-cat.jpg',   5);

-- ============================================================
-- Machine 2 — 限定聯名 (machine_id = 2)
-- ============================================================
INSERT INTO toys (machine_id, name, rarity, price, image_url, weight) VALUES
  (2, '聯名小熊A',     '普通', 180, '/images/toys/m2-bear-a.jpg',       40),
  (2, '聯名小熊B',     '普通', 180, '/images/toys/m2-bear-b.jpg',       35),
  (2, '聯名小貓C',     '普通', 190, '/images/toys/m2-cat.jpg',          30),
  (2, '限定魔法少女',  '稀有', 350, '/images/toys/m2-magical-girl.jpg', 22),
  (2, '限定機器人',    '稀有', 360, '/images/toys/m2-robot.jpg',        18),
  (2, '聯名龍年特別版','史詩', 600, '/images/toys/m2-dragon.jpg',       10),
  (2, '聯名初回典藏版','傳說', 900, '/images/toys/m2-collector.jpg',     5);

-- ============================================================
-- Machine 3 — 稀有收藏 (machine_id = 3)
-- ============================================================
INSERT INTO toys (machine_id, name, rarity, price, image_url, weight) VALUES
  (3, '水晶小狼',       '普通', 300, '/images/toys/m3-wolf.jpg',         35),
  (3, '星空貓咪',       '普通', 300, '/images/toys/m3-starry-cat.jpg',   30),
  (3, '雪白兔兔',       '稀有', 500, '/images/toys/m3-white-rabbit.jpg', 25),
  (3, '霓虹蝴蝶',       '稀有', 520, '/images/toys/m3-butterfly.jpg',    20),
  (3, '夢幻鳳凰',       '史詩', 900, '/images/toys/m3-phoenix.jpg',      12),
  (3, '神龍限量版',     '史詩', 950, '/images/toys/m3-dragon.jpg',        8),
  (3, '奧義聖獸',       '傳說',1500, '/images/toys/m3-holy-beast.jpg',   5),
  (3, '混沌起源典藏',   '傳說',2000, '/images/toys/m3-chaos.jpg',         3);

-- ============================================================
-- Admin account (username: admin / password: admin123)
-- ============================================================
INSERT INTO users (username, password_hash, is_admin) VALUES
  ('admin', '$2b$10$EhFPnGG5F54gIEV/XZATZeE7YErBfngooccoPSZ6GFHHQYpFk/2QG', 1);
