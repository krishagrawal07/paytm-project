import pool from "../config/db.js";
import { sendSuccess, sendError } from "../middleware/errorMiddleware.js";

const parseId = (id) => {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getAllTransactions = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM transactions ORDER BY transaction_id DESC");
    return sendSuccess(res, "Transactions fetched successfully", rows);
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

    const [rows] = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (!rows.length) {
      return sendError(res, "Transaction not found", null, 404);
    }

    return sendSuccess(res, "Transaction fetched successfully", rows[0]);
  } catch (error) {
    return next(error);
  }
};

const validateTransactionPayload = ({ user_id, merchant_id, account_id, amount, transaction_status, transaction_date }) => {
  if (!user_id || !merchant_id || !account_id) {
    return "user_id, merchant_id and account_id are required";
  }

  if (amount === undefined || amount === null || amount === "") {
    return "amount is required";
  }

  if (!transaction_status) {
    return "transaction_status is required";
  }

  if (!transaction_date) {
    return "transaction_date is required";
  }

  return "";
};

const verifyReferences = async (userId, merchantId, accountId) => {
  const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [userId]);
  if (!userRows.length) {
    return "User not found";
  }

  const [merchantRows] = await pool.query(
    "SELECT merchant_id FROM merchants WHERE merchant_id = ?",
    [merchantId]
  );
  if (!merchantRows.length) {
    return "Merchant not found";
  }

  const [accountRows] = await pool.query(
    "SELECT account_id, user_id FROM accounts WHERE account_id = ?",
    [accountId]
  );
  if (!accountRows.length) {
    return "Account not found";
  }

  if (Number(accountRows[0].user_id) !== userId) {
    return "Selected account does not belong to the selected user";
  }

  return "";
};

const createTransaction = async (req, res, next) => {
  try {
    const payloadError = validateTransactionPayload(req.body || {});
    if (payloadError) {
      return sendError(res, payloadError, null, 400);
    }

    const userId = parseId(req.body.user_id);
    const merchantId = parseId(req.body.merchant_id);
    const accountId = parseId(req.body.account_id);
    const amountValue = Number(req.body.amount);
    const transaction_type = normalizeText(req.body.transaction_type);
    const transaction_status = normalizeText(req.body.transaction_status);
    const transaction_date = normalizeText(req.body.transaction_date);

    if (!userId || !merchantId || !accountId) {
      return sendError(res, "user_id, merchant_id and account_id must be valid numbers", null, 400);
    }

    if (Number.isNaN(amountValue)) {
      return sendError(res, "amount must be a valid number", null, 400);
    }

    if (!dateRegex.test(transaction_date)) {
      return sendError(res, "transaction_date must be in YYYY-MM-DD format", null, 400);
    }

    const referenceError = await verifyReferences(userId, merchantId, accountId);
    if (referenceError) {
      return sendError(res, referenceError, null, 400);
    }

    const [result] = await pool.query(
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

    const [createdRows] = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [result.insertId]
    );

    return sendSuccess(res, "Transaction created successfully", createdRows[0], 201);
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

    const payloadError = validateTransactionPayload(req.body || {});
    if (payloadError) {
      return sendError(res, payloadError, null, 400);
    }

    const userId = parseId(req.body.user_id);
    const merchantId = parseId(req.body.merchant_id);
    const accountId = parseId(req.body.account_id);
    const amountValue = Number(req.body.amount);
    const transaction_type = normalizeText(req.body.transaction_type);
    const transaction_status = normalizeText(req.body.transaction_status);
    const transaction_date = normalizeText(req.body.transaction_date);

    if (!userId || !merchantId || !accountId) {
      return sendError(res, "user_id, merchant_id and account_id must be valid numbers", null, 400);
    }

    if (Number.isNaN(amountValue)) {
      return sendError(res, "amount must be a valid number", null, 400);
    }

    if (!dateRegex.test(transaction_date)) {
      return sendError(res, "transaction_date must be in YYYY-MM-DD format", null, 400);
    }

    const [existingRows] = await pool.query(
      "SELECT transaction_id FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (!existingRows.length) {
      return sendError(res, "Transaction not found", null, 404);
    }

    const referenceError = await verifyReferences(userId, merchantId, accountId);
    if (referenceError) {
      return sendError(res, referenceError, null, 400);
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

    const [updatedRows] = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );

    return sendSuccess(res, "Transaction updated successfully", updatedRows[0]);
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

    const [result] = await pool.query("DELETE FROM transactions WHERE transaction_id = ?", [transactionId]);
    if (result.affectedRows === 0) {
      return sendError(res, "Transaction not found", null, 404);
    }

    return sendSuccess(res, "Transaction deleted successfully", { transaction_id: transactionId });
  } catch (error) {
    return next(error);
  }
};

export {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
