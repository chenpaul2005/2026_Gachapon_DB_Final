# Agent Context — 扭蛋樂園 (Gachapon Roulette)

## IMPORTANT — Always Follow the Course Instructions

**Before making any changes, read `Final_Project_Instructions_EN.md` in the project root.**
Every feature, database design decision, and implementation choice must remain compliant with the professor's specifications. The oral defense is worth 50% of the grade — maintain clean, explainable code and sound relational database design at all times.

---

## Project Overview

A CS database final project: a Counter-Strike case-opening–style gachapon (扭蛋) website built with:

- **Backend:** Node.js + Express 4
- **Database:** SQLite via `better-sqlite3`
- **Auth:** Session-based (`express-session` + `bcrypt`)
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Language:** Traditional Chinese (繁體中文) UI throughout

---

## How to Run

```bash
npm install          # install dependencies
npm run db:init      # create DB from schema.sql + seed.sql (run once, or to reset)
npm start            # start server on http://localhost:3000
```

> `db:init` reinitialises `db/gachapon.db` from scratch. Running it again wipes all data.
> `lib/db.js` also runs `db/migrate.sql` on every server start — safe to re-run (idempotent).

---

## Project Structure

```
server.js               Express entry point
lib/db.js               SQLite singleton; runs migrate.sql on every startup
db/
  schema.sql            Table definitions (run once via db:init)
  seed.sql              Seed data: machines + toys (Traditional Chinese)
  init.js               Runs schema.sql → migrate.sql → seed.sql
  migrate.sql           Idempotent migrations (table renames for schema evolution)
middleware/
  requireAuth.js        Session guard — returns 401 if not logged in
routes/
  auth.js               POST /api/auth/register, login, logout
  wallet.js             GET/POST /api/wallet (balance + transaction history)
  machines.js           GET /api/machines, POST /api/machines/:id/pull
  inventory.js          GET /api/inventory, POST /api/inventory/:id/sell
  shipments.js          POST /api/shipments, GET /api/shipments, GET /api/shipments/:id
public/
  login.html            Login page
  register.html         Registration page
  index.html            Machine listing (home)
  gacha.html            Roulette spin page
  inventory.html        Inventory with multi-select shipping
  wallet.html           Wallet / transaction history
  shipments.html        Shipment tracking page
  css/style.css         Global styles (dark theme)
  js/api.js             Shared fetch helpers, toast notifications, nav init
```

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `users` | Accounts: `username`, `password_hash`, `balance` |
| `machines` | Gachapon machines with `pull_price` |
| `toys` | Items per machine: `rarity`, `price`, `weight` (for weighted random) |
| `user_inventory` | Items a user has pulled; `status` = `owned` or `sold` |
| `transactions` | Ledger: `type` ∈ `deposit`, `pull`, `sell`, `shipping` |
| `shipments` | Shipping orders: `shipping_type`, `address`, `fee`, `status` |
| `shipment_items` | Junction: which `inventory_id` rows belong to a shipment |

### Rarity Values
`普通` (Common) · `稀有` (Rare) · `史詩` (Epic) · `傳說` (Legendary)

### Shipment Status Values
`processing` → `shipped` → `delivering` → `delivered`

> The `shipments.status` column has **no** CHECK constraint (removed via migration) so all four values are valid.

---

## Key Design Decisions

1. **Server-side pull logic** — weighted random selection runs on the server, never the client, preventing manipulation.
2. **Atomic transactions** — `db.transaction()` wraps pull, sell, and ship operations to maintain consistency (ACID).
3. **60% sell-back** — selling an item credits `toy.price * 0.6` to the user's balance.
4. **Shipping fees** — Home: ¥90, Convenience store: ¥60. Convenience store capped at 20 items; exceeding it doubles the fee and splits into two packages.
5. **Migration pattern** — Schema changes use a temp-rename trick (create `_new`, copy, drop old, rename) because SQLite doesn't support `ALTER COLUMN`.
6. **FK safety during migration** — `lib/db.js` sets `PRAGMA foreign_keys = OFF` before running `migrate.sql`, then re-enables it.

---

## API Summary

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login (sets session) |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/wallet` | Balance + transaction history |
| POST | `/api/wallet/deposit` | Add funds |
| GET | `/api/machines` | List all machines |
| GET | `/api/machines/:id` | Machine detail + toy list |
| POST | `/api/machines/:id/pull` | Perform a pull (deducts balance) |
| GET | `/api/inventory` | Current user's owned items |
| POST | `/api/inventory/:id/sell` | Sell an item for 60% |
| POST | `/api/shipments` | Create a shipment |
| GET | `/api/shipments` | List user's shipments |
| GET | `/api/shipments/:id` | Shipment detail with items |

All API routes except auth require a valid session (enforced by `requireAuth` middleware).

---

## Things to Keep in Mind

- **Do not use frameworks** (React, Vue, etc.) — the professor expects plain HTML/CSS/JS on the frontend.
- **Always use parameterised queries** — never string-concatenate user input into SQL.
- **Keep the UI in Traditional Chinese (繁體中文).**
- **Do not break existing features** when adding new ones — the oral defense requires everything to be live and working.
- **Check `db/migrate.sql`** before altering schema — use the idempotent temp-rename pattern for any column/constraint changes.
- **Run `npm run db:init` only to reset** — it wipes all data. For schema additions on a live DB, use `migrate.sql`.
