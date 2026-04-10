# Paytm-Like Full Stack DBMS Project

A complete Paytm-style admin dashboard built with React, Vite, Tailwind CSS, Node.js, Express, and MySQL.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Axios + React Router DOM
- Backend: Node.js + Express + JWT
- Database: MySQL (`mysql2/promise`)

## Project Structure
```text
paytm-project/
  backend/
    config/db.js
    controllers/
    middleware/
    routes/
    utils/generateToken.js
    server.js
    package.json
    .env.example
    paytm_schema.sql
    paytm_seed.sql
    paytm_reports.sql
  frontend/
    src/
      api/axiosInstance.js
      components/
      pages/
      App.jsx
      main.jsx
      index.css
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
  README.md
```

## Database Setup (MySQL Workbench or MySQL CLI)
1. Open MySQL Workbench.
2. Run `backend/paytm_schema.sql`.
3. Run `backend/paytm_seed.sql`.

This creates and populates `paytm_db` with:
- `users`
- `merchants`
- `accounts`
- `transactions`
- `payments`

## Backend Setup
1. Open terminal in `paytm-project/backend`.
2. Install dependencies:
```bash
npm install
```
3. Create `.env` from `.env.example`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=paytm_db
JWT_SECRET=supersecretkey
ADMIN_EMAIL=admin@paytm.com
ADMIN_PASSWORD=admin123
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
4. Start backend:
```bash
npm run dev
```

## Frontend Setup
1. Open terminal in `paytm-project/frontend`.
2. Install dependencies:
```bash
npm install
```
3. Start frontend:
```bash
npm run dev
```
4. Open: `http://localhost:5173`

## Default Admin Login
- Email: `admin@paytm.com`
- Password: `admin123`

## API Base URL Used by Frontend
- `http://localhost:5000/api`

## Health Check
- `GET http://localhost:5000/api/health/db`

## Implemented APIs
### Auth
- `POST /api/auth/login`

### Users CRUD
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Merchants CRUD
- `GET /api/merchants`
- `GET /api/merchants/:id`
- `POST /api/merchants`
- `PUT /api/merchants/:id`
- `DELETE /api/merchants/:id`

### Accounts CRUD
- `GET /api/accounts`
- `GET /api/accounts/:id`
- `POST /api/accounts`
- `PUT /api/accounts/:id`
- `DELETE /api/accounts/:id`

### Transactions CRUD
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Payments CRUD
- `GET /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments`
- `PUT /api/payments/:id`
- `DELETE /api/payments/:id`

### Reports
- `GET /api/reports/top-users-transactions`
- `GET /api/reports/users-with-payments`
- `GET /api/reports/amazon-transactions-2023`
- `GET /api/reports/user-email-transaction`
- `GET /api/reports/merchants-no-transactions`
- `GET /api/reports/zomato-users`
- `GET /api/reports/ecommerce-users`
- `GET /api/reports/highest-average-merchant`
- `GET /api/reports/users-more-than-5-payments`
- `GET /api/reports/merchant-commission`
