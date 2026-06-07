# 🎰 扭蛋樂園 — 資料庫期末專題

**資料庫期末專題** — 以 Node.js + Express + SQLite 建構的全端扭蛋網站。

**線上網站**：https://two026-gachapon-db-final.onrender.com

---

## 系統需求

- Node.js 18 以上
- npm

---

## 安裝與啟動

```bash
# 1. 安裝套件
npm install

# 2. 初始化資料庫（建立資料表 + 種子資料）
npm run db:init

# 3. 啟動伺服器
npm start

# 4. 開啟瀏覽器前往
#    http://localhost:3000
```

---

## 功能介紹

1. **註冊 / 登入**：帳號密碼驗證（bcrypt 雜湊），Session 維持登入狀態。
2. **錢包儲值**：輸入任意金額存入帳戶餘額，金流記錄寫入 `transactions` 表。
3. **扭蛋機台**：首頁列出所有機台，點擊進入後可觀看轉盤動畫並抽出一件公仔。
4. **我的背包**：顯示持有中的公仔，可逐件以市值的 60% 賣回網站。
5. **多選出貨**：背包可多選公仔寄送，支援宅配（90 元）或超商取件（60 元），超過 20 件時自動拆兩箱並加倍運費。
6. **出貨追蹤**：以進度條顯示物流狀態（處理中 → 已出貨 → 配送中 → 已送達）。
7. **管理後台**：管理員可檢視所有使用者背包，並更新出貨單的物流狀態。

---

## 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `PORT` | 伺服器埠號 | `3000` |
| `SESSION_SECRET` | Session 加密金鑰 | `gachapon-dev-secret` |

---

## 資料庫設計

### 資料表（共 7 張）

| 資料表 | 說明 |
|--------|------|
| `users` | 使用者帳號、密碼雜湊、餘額、管理員旗標 |
| `machines` | 扭蛋機台（名稱、描述、每抽價格） |
| `toys` | 公仔目錄（所屬機台、稀有度、市值、機率權重） |
| `user_inventory` | 使用者持有的公仔實例（狀態：owned / sold） |
| `transactions` | 所有金流紀錄（儲值、抽蛋、售回、運費） |
| `shipments` | 出貨單（寄送方式、地址、運費、物流狀態） |
| `shipment_items` | 出貨明細（出貨單與背包物品的關聯表，解開 M:N） |

### 實體關聯

```
users (1) ──< user_inventory (N)
users (1) ──< transactions   (N)
users (1) ──< shipments      (N)
machines (1) ──< toys        (N)
toys  (1) ──< user_inventory (N)
shipments (M) ──< shipment_items >── (N) user_inventory
```

### 關鍵設計決策

- **抽獎邏輯在伺服器端**：加權隨機選擇在後端執行，防止使用者操控結果。
- **原子交易**：抽蛋、售回、出貨均使用 `db.transaction()` 確保 ACID 一致性。
- **參數化查詢**：所有 SQL 均使用 `?` 佔位符，防止 SQL Injection。
- **遷移機制**：`migrate.sql` 每次啟動自動執行，以暫存表改名技巧安全更新 schema（SQLite 不支援 ALTER COLUMN）。

---

## 專案結構

```
Database_Final/
├── server.js               # Express 主程式
├── package.json
├── db/
│   ├── schema.sql          # 資料表定義
│   ├── seed.sql            # 種子資料（3 個機台、22 種公仔）
│   ├── migrate.sql         # 冪等式資料庫遷移腳本
│   └── init.js             # 初始化腳本
├── routes/
│   ├── auth.js             # 註冊 / 登入 / 登出
│   ├── wallet.js           # 餘額查詢 / 儲值
│   ├── machines.js         # 機台列表 / 抽蛋 API
│   ├── inventory.js        # 背包查詢 / 售回
│   ├── shipments.js        # 出貨單建立 / 查詢
│   └── admin.js            # 管理後台 API
├── middleware/
│   ├── requireAuth.js      # Session 驗證中介層
│   └── requireAdmin.js     # 管理員權限中介層
├── lib/
│   └── db.js               # SQLite 單例（啟動時執行遷移）
└── public/
    ├── index.html          # 首頁（機台列表）
    ├── login.html
    ├── register.html
    ├── wallet.html
    ├── gacha.html          # 轉盤頁面
    ├── inventory.html      # 背包頁面
    ├── shipments.html      # 出貨追蹤頁面
    ├── admin.html          # 管理後台
    ├── css/style.css
    └── js/api.js
```
