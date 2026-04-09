const pool = require("../config/db");
const { sendSuccess, sendError } = require("../middleware/errorMiddleware");

const parseId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
};

const getAllTransactions = async (req, res, next) => {
  try {
    const [transactions] = await pool.query(
      "SELECT * FROM transactions ORDER BY transaction_id DESC"
    );
    return sendSuccess(res, "Transactions fetched successfully", transactions);
  } catch (error) {
    return next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transactionId = parseId(req.params.id);
    if (!transactionId) {
      return sendError(res, "Invalid transaction ID", null, 400);
    }

    const [transactions] = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (transactions.length === 0) {
      return sendError(res, "Transaction not found", null, 404);
    }

    return sendSuccess(res, "Transaction fetched successfully", transactions[0]);
  } catch (error) {
    return next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const {
      user_id,
      merchant_id,
      account_id,
      amount,
      transaction_type,
      transaction_status,
      transaction_date,
    } = req.body;

    if (
      !user_id ||
      !merchant_id ||
      !account_id ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !transaction_status ||
      !transaction_date
    ) {
      return sendError(
        res,
        "user_id, merchant_id, account_id, amount, transaction_status and transaction_date are required",
        null,
        400
      );
    }

    const userId = parseId(user_id);
    const merchantId = parseId(merchant_id);
    const accountId = parseId(account_id);
    const amountValue = Number(amount);

    if (!userId || !merchantId || !accountId || Number.isNaN(amountValue)) {
      return sendError(res, "Invalid input values", null, 400);
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (userRows.length === 0) {
      return sendError(res, "User not found", null, 404);
    }

    const [merchantRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );
    if (merchantRows.length === 0) {
      return sendError(res, "Merchant not found", null, 404);
    }

    const [accountRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_id = ?",
      [accountId]
    );
    if (accountRows.length === 0) {
      return sendError(res, "Account not found", null, 404);
    }

    const [insertResult] = await pool.query(
      `INSERT INTO transactions
      (user_id, merchant_id, account_id, amount, transaction_type, transaction_status, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        merchantId,
        accountId,
        amountValue,
        transaction_type || null,
        transaction_status,
        transaction_date,
      ]
    );

    const [createdTransaction] = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [insertResult.insertId]
    );

    return sendSuccess(
      res,
      "Transaction created successfully",
      createdTransaction[0],
      201
    );
  } catch (error) {
    return next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transactionId = parseId(req.params.id);
    if (!transactionId) {
      return sendError(res, "Invalid transaction ID", null, 400);
    }

    const {
      user_id,
      merchant_id,
      account_id,
      amount,
      transaction_type,
      transaction_status,
      transaction_date,
    } = req.body;

    if (
      !user_id ||
      !merchant_id ||
      !account_id ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !transaction_status ||
      !transaction_date
    ) {
      return sendError(
        res,
        "user_id, merchant_id, account_id, amount, transaction_status and transaction_date are required",
        null,
        400
      );
    }

    const userId = parseId(user_id);
    const merchantId = parseId(merchant_id);
    const accountId = parseId(account_id);
    const amountValue = Number(amount);

    if (!userId || !merchantId || !accountId || Number.isNaN(amountValue)) {
      return sendError(res, "Invalid input values", null, 400);
    }

    const [transactionRows] = await pool.query(
      "SELECT transaction_id FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (transactionRows.length === 0) {
      return sendError(res, "Transaction not found", null, 404);
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (userRows.length === 0) {
      return sendError(res, "User not found", null, 404);
    }

    const [merchantRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );
    if (merchantRows.length === 0) {
      return sendError(res, "Merchant not found", null, 404);
    }

    const [accountRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_id = ?",
      [accountId]
    );
    if (accountRows.length === 0) {
      return sendError(res, "Account not found", null, 404);
    }

    await pool.query(
      `UPDATE transactions
       SET user_id = ?, merchant_id = ?, account_id = ?, amount = ?, transaction_type = ?, transaction_status = ?, transaction_date = ?
       WHERE transaction_id = ?`,
      [
        userId,
        merchantId,
        accountId,
        amountValue,
        transaction_type || null,
        transaction_status,
        transaction_date,
        transactionId,
      ]
    );

    const [updatedTransaction] = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );

    return sendSuccess(
      res,
      "Transaction updated successfully",
      updatedTransaction[0]
    );
  } catch (error) {
    return next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transactionId = parseId(req.params.id);
    if (!transactionId) {
      return sendError(res, "Invalid transaction ID", null, 400);
    }

    const [deleteResult] = await pool.query(
      "DELETE FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (deleteResult.affectedRows === 0) {
      return sendError(res, "Transaction not found", null, 404);
    }

    return sendSuccess(res, "Transaction deleted successfully", {
      transaction_id: transactionId,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
