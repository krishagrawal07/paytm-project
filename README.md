# Paytm-Like College DBMS Project

## Project Description
This is a fully complete full-stack DBMS project inspired by a Paytm case study.  
It manages users, merchants, accounts, transactions, payments, and analytics reports using React, Express, and MySQL.

## Tech Stack
- Frontend: React.js, Vite, Tailwind CSS, React Router DOM, Axios
- Backend: Node.js, Express.js
- Database: MySQL (`mysql2`)
- Authentication: JWT-based admin login

## Folder Structure
```text
paytm-project/
  backend/
    package.json
    .env
    server.js
    config/
      db.js
    middleware/
      authMiddleware.js
      errorMiddleware.js
    controllers/
      authController.js
      userController.js
      merchantController.js
      accountController.js
      transactionController.js
      paymentController.js
      reportController.js
    routes/
      authRoutes.js
      userRoutes.js
      merchantRoutes.js
      accountRoutes.js
      transactionRoutes.js
      paymentRoutes.js
      reportRoutes.js
    utils/
      generateToken.js
  frontend/
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    index.html
    src/
      main.jsx
      App.jsx
      index.css
      api/
        axiosInstance.js
      components/
        Navbar.jsx
        Sidebar.jsx
        ProtectedRoute.jsx
        PageHeader.jsx
        DataTable.jsx
        StatCard.jsx
      pages/
        Login.jsx
        Dashboard.jsx
        Users.jsx
        Merchants.jsx
        Accounts.jsx
        Transactions.jsx
        Payments.jsx
        Reports.jsx
        NotFound.jsx
  README.md
```

## Backend Setup
1. Open terminal in `paytm-project/backend`
2. Install packages:
   ```bash
   npm install
   ```
3. Configure `.env` (sample below)
4. Ensure your MySQL database and tables exist
5. Run backend:
   ```bash
   npm run dev
   ```

## Frontend Setup
1. Open another terminal in `paytm-project/frontend`
2. Install packages:
   ```bash
   npm install
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```
4. Open the URL shown by Vite (usually `http://localhost:5173`)

## Environment Variables (`backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=paytm_db
JWT_SECRET=supersecretkey
```

## MySQL Setup Note
- This project assumes these tables already exist:
  - `users`
  - `merchants`
  - `accounts`
  - `transactions`
  - `payments`
- The backend code does not create tables automatically.
- Ready SQL files are included:
  - `backend/paytm_schema.sql`
  - `backend/paytm_seed.sql`

### Quick MySQL Import (optional, recommended)
1. Open MySQL shell or MySQL Workbench
2. Run `backend/paytm_schema.sql`
3. Run `backend/paytm_seed.sql`

## Run Project
1. Start MySQL server and ensure `paytm_db` is available
2. Start backend (`npm run dev` inside `backend`)
3. Start frontend (`npm run dev` inside `frontend`)
4. Open frontend URL in browser

## Default Admin Login
- Email: `admin@paytm.com`
- Password: `admin123`

## Available API Endpoints

### Auth
- `POST /api/auth/login`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Merchants
- `GET /api/merchants`
- `GET /api/merchants/:id`
- `POST /api/merchants`
- `PUT /api/merchants/:id`
- `DELETE /api/merchants/:id`

### Accounts
- `GET /api/accounts`
- `GET /api/accounts/:id`
- `POST /api/accounts`
- `PUT /api/accounts/:id`
- `DELETE /api/accounts/:id`

### Transactions
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Payments
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

## Reports Included
1. Users with more than 10 transactions
2. Users with at least one payment
3. Amazon merchant transactions in 2023
4. User email and transaction ID listing
5. Merchants with no transactions
6. Users who made payments to Zomato
7. Users who transacted with E-commerce merchants
8. Merchant with highest average transaction value
9. Users with more than 5 payments
10. Total 2% commission by merchant
