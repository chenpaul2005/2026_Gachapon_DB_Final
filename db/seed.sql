-- ============================================================
-- Machines
-- ============================================================
INSERT INTO machines (name, description, pull_price, image_url) VALUES
  ('經典扭蛋', '最受歡迎的入門款扭蛋，收錄多款可愛角色公仔，每次只要 50 元！', 50,
   'https://placehold.co/300x300/f9a8d4/ffffff?text=經典扭蛋'),
  ('限定聯名', '與知名動漫IP聯名合作的限定款，稀有度更高，值得收藏！', 120,
   'https://placehold.co/300x300/93c5fd/ffffff?text=限定聯名'),
  ('稀有收藏', '頂級收藏系列，傳說等級出率提升，是資深玩家的首選！', 200,
   'https://placehold.co/300x300/c4b5fd/ffffff?text=稀有收藏');

-- ============================================================
-- Machine 1 — 經典扭蛋 (machine_id = 1)
-- ============================================================
INSERT INTO toys (machine_id, name, rarity, price, image_url, weight) VALUES
  (1, '小熊貓公仔',   '普通', 80,  'https://placehold.co/200x200/fca5a5/ffffff?text=小熊貓', 45),
  (1, '花貓咪公仔',   '普通', 80,  'https://placehold.co/200x200/fdba74/ffffff?text=花貓咪', 40),
  (1, '小企鵝公仔',   '普通', 80,  'https://placehold.co/200x200/86efac/ffffff?text=小企鵝', 35),
  (1, '兔兔公仔',     '稀有', 150, 'https://placehold.co/200x200/67e8f9/ffffff?text=兔兔',   25),
  (1, '小恐龍公仔',   '稀有', 160, 'https://placehold.co/200x200/818cf8/ffffff?text=小恐龍', 20),
  (1, '彩虹獨角獸',   '史詩', 300, 'https://placehold.co/200x200/f472b6/ffffff?text=獨角獸', 10),
  (1, '黃金招財貓',   '傳說', 500, 'https://placehold.co/200x200/fbbf24/ffffff?text=招財貓',  5);

-- ============================================================
-- Machine 2 — 限定聯名 (machine_id = 2)
-- ============================================================
INSERT INTO toys (machine_id, name, rarity, price, image_url, weight) VALUES
  (2, '聯名小熊A',     '普通', 180, 'https://placehold.co/200x200/fca5a5/ffffff?text=聯名A',  40),
  (2, '聯名小熊B',     '普通', 180, 'https://placehold.co/200x200/fdba74/ffffff?text=聯名B',  35),
  (2, '聯名小貓C',     '普通', 190, 'https://placehold.co/200x200/86efac/ffffff?text=聯名C',  30),
  (2, '限定魔法少女',  '稀有', 350, 'https://placehold.co/200x200/67e8f9/ffffff?text=魔法少女',22),
  (2, '限定機器人',    '稀有', 360, 'https://placehold.co/200x200/818cf8/ffffff?text=機器人',  18),
  (2, '聯名龍年特別版','史詩', 600, 'https://placehold.co/200x200/f472b6/ffffff?text=龍年版',  10),
  (2, '聯名初回典藏版','傳說', 900, 'https://placehold.co/200x200/fbbf24/ffffff?text=典藏版',   5);

-- ============================================================
-- Machine 3 — 稀有收藏 (machine_id = 3)
-- ============================================================
INSERT INTO toys (machine_id, name, rarity, price, image_url, weight) VALUES
  (3, '水晶小狼',       '普通', 300, 'https://placehold.co/200x200/fca5a5/ffffff?text=水晶小狼',35),
  (3, '星空貓咪',       '普通', 300, 'https://placehold.co/200x200/fdba74/ffffff?text=星空貓',  30),
  (3, '雪白兔兔',       '稀有', 500, 'https://placehold.co/200x200/67e8f9/ffffff?text=雪白兔',  25),
  (3, '霓虹蝴蝶',       '稀有', 520, 'https://placehold.co/200x200/818cf8/ffffff?text=霓虹蝴蝶',20),
  (3, '夢幻鳳凰',       '史詩', 900, 'https://placehold.co/200x200/f472b6/ffffff?text=夢幻鳳凰',12),
  (3, '神龍限量版',     '史詩', 950, 'https://placehold.co/200x200/c084fc/ffffff?text=神龍',     8),
  (3, '奧義聖獸',       '傳說',1500, 'https://placehold.co/200x200/fbbf24/ffffff?text=奧義聖獸',  5),
  (3, '混沌起源典藏',   '傳說',2000, 'https://placehold.co/200x200/f97316/ffffff?text=混沌起源',  3);

-- ============================================================
-- Admin account (username: admin / password: admin123)
-- ============================================================
INSERT INTO users (username, password_hash, is_admin) VALUES
  ('admin', '$2b$10$EhFPnGG5F54gIEV/XZATZeE7YErBfngooccoPSZ6GFHHQYpFk/2QG', 1);
