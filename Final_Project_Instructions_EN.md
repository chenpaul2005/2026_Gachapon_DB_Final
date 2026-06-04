# Database × Full-Stack Integration — Final Project Specification

**Course context:** Undergraduate database course focused on SQLite and Node.js.

---

## Project Overview

Students must build a working web application that demonstrates full-stack integration: a frontend UI, a backend server, and a SQLite database. The system must be live and functional — screenshots alone are not sufficient.

---

## Required Deliverables

### 1. Frontend (at least one HTML page)
- A web page with a form or UI that accepts user input
- Must be browsable as a `.html` file
- Layout should be clear and intuitive

### 2. Database (at least one table)
- At least one SQLite table with well-named columns and correct data types
- Data must be successfully written to the database

### 3. Backend Integration
- Data entered on the frontend must be sent to and stored in the database via a backend
- Acceptable backend languages: Node.js, Python, or equivalent
- The full data flow must work: frontend → backend → database

### 4. Oral Defense (see below)
- Students must explain their design decisions verbally
- This is **not** a generic Q&A — questions will be specific to each student's project

### 5. (Optional, Bonus) Online Deployment
- Not required, but awards extra points if completed
- Suggested platforms: Netlify, Heroku, PythonAnywhere
- Must be a live, accessible URL — screenshots do not count

---

## Grading Breakdown

| Component | Weight | Description |
|---|---|---|
| Frontend Design & Functionality | 10% | At least one page with a form; clear layout and usable UI |
| Database Design | 20% | Well-structured table(s), correct types, successful data storage, reasonable relational design |
| Frontend–Backend Integration | 20% | Data entered on frontend successfully reaches the database |
| Oral Defense | 50% | 5–6 questions from the instructor, specific to the student's own project |
| Bonus | +extra | Live deployment, additional features, polished UI, technically ambitious implementation |

---

## Project Ideas (Reference Only)

Students may build any project that satisfies the requirements. The following are examples:

| Idea | Features | Tables |
|---|---|---|
| Food ordering system | Menu input, kitchen order view, order status | Customers, Menu Items, Orders |
| Personal blog | Create/edit posts, category tags, comments | Posts, Categories, Comments |
| Library system | Book search, borrow/return records, due date alerts | Books, Members, Loans |
| Expense tracker | Add income/expense entries, categories, monthly charts | Transactions, Categories, Budgets |
| Simple e-commerce | Product listings, shopping cart, order management | Products, Orders, Order Items |
| Game leaderboard | Player registration, score upload, ranking display | Players, Game Records |

---

## Oral Defense Details

- **Weight:** 50% of total project grade
- **Format:** 5–6 questions from the instructor during final project review
- **Nature of questions:** Targeted at the student's specific project — no generic answers accepted
- **Follow-up questions:** The instructor may ask follow-up questions based on student responses

### Three Pre-Released Questions

These three questions will definitely appear. Prepare answers specific to your own project.

**Q1 — Draw your ER diagram**
- Label all entities (Entity) and their attributes (Attribute)
- Draw all relationships (Relationship) and cardinalities (1:1 / 1:N / M:N)
- Verbally explain: why did you design it this way?

**Q2 — Write a SQL query actually used in your project**
- Choose a frontend page that displays data
- Write the corresponding `SELECT` statement
- Explain why the query is written that way

**Q3 — Show me 3 real rows from your database**
- Where did these 3 rows come from?
- Do they have foreign key relationships with each other?
- Is there anything in the data that looks unusual? Why?

---

## Preparation Checklist

- [ ] The system runs end-to-end — not just a mockup or screenshots
- [ ] ER diagram is drawn (draw.io or hand-drawn) and explainable verbally
- [ ] You know every table's column names, data types, and the reasoning behind each choice
- [ ] You can trace the full data flow: frontend form submission → backend route → database write
- [ ] The database contains real data generated through frontend interaction (not just manually inserted rows)

> **Note:** Memorizing generic answers will not work. Every question will be tied to your specific project implementation.
