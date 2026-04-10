import pool from "../config/db.js";
import { sendSuccess, sendError } from "../middleware/errorMiddleware.js";

const parseId = (id) => {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getAllAccounts = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM accounts ORDER BY account_id DESC");
    return sendSuccess(res, "Accounts fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const accountId = parseId(req.params.id);
    if (!accountId) {
      return sendError(res, "Invalid account ID", null, 400);
    }

    const [rows] = await pool.query("SELECT * FROM accounts WHERE account_id = ?", [accountId]);
    if (!rows.length) {
      return sendError(res, "Account not found", null, 404);
    }

    return sendSuccess(res, "Account fetched successfully", rows[0]);
  } catch (error) {
    return next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const userId = parseId(req.body?.user_id);
    const account_number = normalizeText(req.body?.account_number);
    const account_type = normalizeText(req.body?.account_type);
    const created_at = normalizeText(req.body?.created_at);
    const balanceValue =
      req.body?.balance === undefined || req.body?.balance === null || req.body?.balance === ""
        ? 0
        : Number(req.body.balance);

    if (!userId || !account_number || !account_type) {
      return sendError(res, "user_id, account_number and account_type are required", null, 400);
    }

    if (Number.isNaN(balanceValue)) {
      return sendError(res, "Balance must be a valid number", null, 400);
    }

    if (created_at && !dateRegex.test(created_at)) {
      return sendError(res, "created_at must be in YYYY-MM-DD format", null, 400);
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [userId]);
    if (!userRows.length) {
      return sendError(res, "User not found for this account", null, 404);
    }

    const [duplicateRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_number = ?",
      [account_number]
    );
    if (duplicateRows.length > 0) {
      return sendError(res, "Account number already exists", null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, account_number, account_type, balanceValue, created_at || null]
    );

    const [createdRows] = await pool.query("SELECT * FROM accounts WHERE account_id = ?", [result.insertId]);
    return sendSuccess(res, "Account created successfully", createdRows[0], 201);
  } catch (error) {
    return next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const accountId = parseId(req.params.id);
    if (!accountId) {
      return sendError(res, "Invalid account ID", null, 400);
    }

    const userId = parseId(req.body?.user_id);
    const account_number = normalizeText(req.body?.account_number);
    const account_type = normalizeText(req.body?.account_type);
    const created_at = normalizeText(req.body?.created_at);
    const balanceValue =
      req.body?.balance === undefined || req.body?.balance === null || req.body?.balance === ""
        ? 0
        : Number(req.body.balance);

    if (!userId || !account_number || !account_type) {
      return sendError(res, "user_id, account_number and account_type are required", null, 400);
    }

    if (Number.isNaN(balanceValue)) {
      return sendError(res, "Balance must be a valid number", null, 400);
    }

    if (created_at && !dateRegex.test(created_at)) {
      return sendError(res, "created_at must be in YYYY-MM-DD format", null, 400);
    }

    const [accountRows] = await pool.query("SELECT account_id FROM accounts WHERE account_id = ?", [accountId]);
    if (!accountRows.length) {
      return sendError(res, "Account not found", null, 404);
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [userId]);
    if (!userRows.length) {
      return sendError(res, "User not found for this account", null, 404);
    }

    const [duplicateRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_number = ? AND account_id != ?",
      [account_number, accountId]
    );
    if (duplicateRows.length > 0) {
      return sendError(res, "Account number already exists", null, 400);
    }

    await pool.query(
      `UPDATE accounts
       SET user_id = ?, account_number = ?, account_type = ?, balance = ?, created_at = ?
       WHERE account_id = ?`,
      [userId, account_number, account_type, balanceValue, created_at || null, accountId]
    );

    const [updatedRows] = await pool.query("SELECT * FROM accounts WHERE account_id = ?", [accountId]);
    return sendSuccess(res, "Account updated successfully", updatedRows[0]);
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const accountId = parseId(req.params.id);
    if (!accountId) {
      return sendError(res, "Invalid account ID", null, 400);
    }

    const [result] = await pool.query("DELETE FROM accounts WHERE account_id = ?", [accountId]);
    if (result.affectedRows === 0) {
      return sendError(res, "Account not found", null, 404);
    }

    return sendSuccess(res, "Account deleted successfully", { account_id: accountId });
  } catch (error) {
    return next(error);
  }
};

export { getAllAccounts, getAccountById, createAccount, updateAccount, deleteAccount };
