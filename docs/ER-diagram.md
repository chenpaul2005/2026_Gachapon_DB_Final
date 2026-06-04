# 扭蛋樂園 — 實體關聯圖（ER Diagram）

> 對應資料庫：`db/schema.sql`  
> 口試時請能說明：為何拆成這些實體、外鍵如何保證一致性、以及 M:N 為何用關聯表解開。

---

## 概念層 ER 圖（Mermaid）

在 GitHub、VS Code（Mermaid 外掛）或 [mermaid.live](https://mermaid.live) 可預覽下圖。

```mermaid
erDiagram
    使用者 ||--o{ 背包項目 : "擁有"
    使用者 ||--o{ 交易紀錄 : "產生"
    使用者 ||--o{ 出貨單 : "建立"
    扭蛋機 ||--|{ 公仔 : "內含"
    公仔 ||--o{ 背包項目 : "對應"
    公仔 |o--o{ 交易紀錄 : "關聯（可為空）"
    背包項目 |o--o{ 交易紀錄 : "關聯（可為空）"
    出貨單 ||--|{ 出貨明細 : "包含"
    背包項目 |o--o| 出貨明細 : "納入"

    使用者 {
        int user_id PK "使用者編號"
        text username UK "帳號"
        text password_hash "密碼雜湊"
        real balance "餘額"
        int is_admin "是否管理員"
        text created_at "註冊時間"
    }

    扭蛋機 {
        int machine_id PK "機台編號"
        text name "名稱"
        text description "說明"
        real pull_price "單次價格"
        text image_url "圖片網址"
    }

    公仔 {
        int toy_id PK "公仔編號"
        int machine_id FK "所屬機台"
        text name "名稱"
        text rarity "稀有度"
        real price "參考價格"
        text image_url "圖片網址"
        int weight "抽中權重"
    }

    背包項目 {
        int inventory_id PK "背包編號"
        int user_id FK "持有者"
        int toy_id FK "公仔"
        text status "狀態 owned/sold"
        text obtained_at "取得時間"
    }

    交易紀錄 {
        int transaction_id PK "交易編號"
        int user_id FK "使用者"
        text type "類型"
        real amount "金額"
        int toy_id FK "公仔（可空）"
        int inventory_id FK "背包（可空）"
        text created_at "時間"
    }

    出貨單 {
        int shipment_id PK "出貨單編號"
        int user_id FK "使用者"
        text shipping_type "宅配/超商"
        text address "地址"
        real fee "運費"
        int package_count "包裹數"
        text payment_method "付款方式"
        text status "物流狀態"
        text created_at "建立時間"
    }

    出貨明細 {
        int shipment_item_id PK "明細編號"
        int shipment_id FK "出貨單"
        int inventory_id FK UK "背包項目"
    }
```

---

## 實體與資料表對照

| 實體（中文） | 資料表 | 說明 |
|---|---|---|
| 使用者 | `users` | 註冊帳號、餘額、管理員旗標 |
| 扭蛋機 | `machines` | 每台機台的價格與展示資訊 |
| 公仔 | `toys` | 隸屬單一機台；含稀有度與抽獎權重 |
| 背包項目 | `user_inventory` | 使用者抽到的公仔實例（可售出、可出貨） |
| 交易紀錄 | `transactions` | 儲值、抽獎扣款、售出入帳、運費等流水帳 |
| 出貨單 | `shipments` | 一筆寄送訂單（地址、運費、狀態） |
| 出貨明細 | `shipment_items` | 出貨單與背包項目的關聯（解開 M:N） |

---

## 關聯與基數（Cardinality）

| 關聯 | 基數 | 實作方式 | 設計理由 |
|---|---|---|---|
| 使用者 — 背包項目 | **1 : N** | `user_inventory.user_id` → `users` | 一人可抽多件公仔 |
| 使用者 — 交易紀錄 | **1 : N** | `transactions.user_id` → `users` | 錢包流水依使用者查詢 |
| 使用者 — 出貨單 | **1 : N** | `shipments.user_id` → `users` | 一人可多次寄送 |
| 扭蛋機 — 公仔 | **1 : N** | `toys.machine_id` → `machines` | 每台機台有多款公仔 |
| 公仔 — 背包項目 | **1 : N** | `user_inventory.toy_id` → `toys` | 同款公仔可被多人／同人多件持有 |
| 公仔 — 交易紀錄 | **1 : N（可選）** | `transactions.toy_id` 可為 NULL | 儲值不需綁公仔；抽獎／售出才填 |
| 背包項目 — 交易紀錄 | **1 : N（可選）** | `transactions.inventory_id` 可為 NULL | 同上 |
| 出貨單 — 背包項目 | **M : N** | 透過 `shipment_items` | 一單多件、一件理論上只會在一張有效出貨單中 |

### 出貨 M:N 的實務約束

- `shipment_items.inventory_id` 設 **UNIQUE**：同一背包列只能出現在一筆出貨明細，避免重複寄送。
- 語意上接近：**出貨單 1:N 出貨明細**，**背包項目 1:0..1 出貨明細**。

---

## ASCII 簡圖（白板／口試快速畫）

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  使用者  │──1:N──│ 背包項目 │──N:1──│  公仔   │
└────┬────┘       └────┬────┘       └────┬────┘
     │                 │                 │
     │1:N              │M:N              │N:1
     │                 │（出貨明細）      │
     ▼                 ▼                 ▼
┌─────────┐       ┌─────────┐       ┌─────────┐
│ 交易紀錄 │       │ 出貨單  │       │ 扭蛋機  │
└─────────┘       └─────────┘       └─────────┘
     │                 │
     └──── 可選關聯 ────┘
         公仔 / 背包項目（nullable FK）
```

---

## 口試可說的設計重點（繁體中文）

1. **公仔 vs. 背包項目**  
   `toys` 是機台內的「款式」；`user_inventory` 是使用者「抽到的那一筆」。售出、出貨都改背包狀態，不刪公仔主檔。

2. **交易紀錄**  
   獨立成表做帳本（deposit / pull / sell / shipping），餘額在 `users.balance`，方便錢包頁一次 `SELECT` 歷史。

3. **出貨明細**  
   標準 M:N 解開；UNIQUE(`inventory_id`) 保證一件公仔不會被重複出貨。

4. **外鍵**  
   `PRAGMA foreign_keys = ON`；遷移時暫時關閉以重建 `shipments` 等表（見 `lib/db.js`）。

5. **管理員**  
   `users.is_admin` 為使用者實體屬性，不另開角色表（課程規模足夠）。

---

## 對應實體關係圖（Chen 風格符號說明）

若教授要求畫在紙上，建議：

- **矩形** = 實體（使用者、扭蛋機、公仔、背包項目、交易紀錄、出貨單、出貨明細）
- **橢圓** = 屬性（標 PK、UK）
- **菱形** = 關係（擁有、內含、產生、包含、納入）
- 線上標 **1**、**N**、**M**

「出貨明細」可畫成**弱實體**（依賴出貨單與背包項目），或畫成**關聯實體**（Associative Entity），兩種說法在口試皆可接受，請與課堂教學用語一致即可。
