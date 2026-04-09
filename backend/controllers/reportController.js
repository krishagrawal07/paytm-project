const pool = require("../config/db");
const { sendSuccess } = require("../middleware/errorMiddleware");

const topUsersTransactions = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name
       FROM users u
       JOIN transactions t ON u.user_id = t.user_id
       GROUP BY u.user_id, u.first_name, u.last_name
       HAVING COUNT(t.transaction_id) > 10
       ORDER BY u.user_id`
    );
    return sendSuccess(res, "Top users by transactions fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const usersWithPayments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT t.user_id
       FROM transactions t
       JOIN payments p ON t.transaction_id = p.transaction_id
       ORDER BY t.user_id`
    );
    return sendSuccess(res, "Users with at least one payment fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const amazonTransactions2023 = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.transaction_id, t.user_id, t.merchant_id, t.account_id, t.amount, t.transaction_type, t.transaction_status, t.transaction_date, m.merchant_name
       FROM transactions t
       JOIN merchants m ON t.merchant_id = m.merchant_id
       WHERE m.merchant_name = 'Amazon' AND YEAR(t.transaction_date) = 2023
       ORDER BY t.transaction_date`
    );
    return sendSuccess(res, "Amazon transactions in 2023 fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const userEmailTransaction = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.email, t.transaction_id
       FROM users u
       JOIN transactions t ON u.user_id = t.user_id
       ORDER BY t.transaction_id`
    );
    return sendSuccess(res, "User email and transaction ID list fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const merchantsNoTransactions = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.merchant_id, m.merchant_name, m.category
       FROM merchants m
       LEFT JOIN transactions t ON m.merchant_id = t.merchant_id
       WHERE t.transaction_id IS NULL
       ORDER BY m.merchant_id`
    );
    return sendSuccess(res, "Merchants with no transactions fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const zomatoUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.email
       FROM users u
       JOIN transactions t ON u.user_id = t.user_id
       JOIN merchants m ON t.merchant_id = m.merchant_id
       JOIN payments p ON t.transaction_id = p.transaction_id
       WHERE m.merchant_name = 'Zomato'
       ORDER BY u.last_name`
    );
    return sendSuccess(res, "Users who made payments to Zomato fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const ecommerceUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.email
       FROM users u
       JOIN transactions t ON u.user_id = t.user_id
       JOIN merchants m ON t.merchant_id = m.merchant_id
       WHERE m.category = 'E-commerce' AND t.transaction_status = 'Completed'
       ORDER BY u.user_id`
    );
    return sendSuccess(
      res,
      "Users who transacted with E-commerce merchants fetched successfully",
      rows
    );
  } catch (error) {
    return next(error);
  }
};

const highestAverageMerchant = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT x.merchant_id, x.merchant_name, x.avg_transaction_value
       FROM (
         SELECT m.merchant_id, m.merchant_name, AVG(t.amount) AS avg_transaction_value
         FROM merchants m
         JOIN transactions t ON m.merchant_id = t.merchant_id
         GROUP BY m.merchant_id, m.merchant_name
       ) x
       WHERE x.avg_transaction_value = (
         SELECT MAX(avg_value) FROM (
           SELECT AVG(amount) AS avg_value
           FROM transactions
           GROUP BY merchant_id
         ) y
       )`
    );
    return sendSuccess(
      res,
      "Merchant with highest average transaction fetched successfully",
      rows
    );
  } catch (error) {
    return next(error);
  }
};

const usersMoreThan5Payments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, COUNT(p.payment_id) AS total_payments
       FROM users u
       JOIN transactions t ON u.user_id = t.user_id
       JOIN payments p ON t.transaction_id = p.transaction_id
       GROUP BY u.user_id, u.first_name, u.last_name
       HAVING COUNT(p.payment_id) > 5
       ORDER BY total_payments DESC`
    );
    return sendSuccess(res, "Users with more than 5 payments fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const merchantCommission = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.merchant_id, m.merchant_name, SUM(t.amount * 0.02) AS total_commission
       FROM merchants m
       JOIN transactions t ON m.merchant_id = t.merchant_id
       GROUP BY m.merchant_id, m.merchant_name
       ORDER BY m.merchant_id`
    );
    return sendSuccess(res, "Merchant commission report fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  topUsersTransactions,
  usersWithPayments,
  amazonTransactions2023,
  userEmailTransaction,
  merchantsNoTransactions,
  zomatoUsers,
  ecommerceUsers,
  highestAverageMerchant,
  usersMoreThan5Payments,
  merchantCommission,
};
