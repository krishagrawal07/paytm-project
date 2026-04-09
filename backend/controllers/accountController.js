const pool = require("../config/db");
const { sendSuccess, sendError } = require("../middleware/errorMiddleware");

const parseId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
};

const getAllAccounts = async (req, res, next) => {
  try {
    const [accounts] = await pool.query(
      "SELECT * FROM accounts ORDER BY account_id DESC"
    );
    return sendSuccess(res, "Accounts fetched successfully", accounts);
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

    const [accounts] = await pool.query("SELECT * FROM accounts WHERE account_id = ?", [
      accountId,
    ]);
    if (accounts.length === 0) {
      return sendError(res, "Account not found", null, 404);
    }

    return sendSuccess(res, "Account fetched successfully", accounts[0]);
  } catch (error) {
    return next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { user_id, account_number, account_type, balance, created_at } = req.body;

    if (!user_id || !account_number || !account_type) {
      return sendError(
        res,
        "user_id, account_number and account_type are required",
        null,
        400
      );
    }

    const userId = parseId(user_id);
    if (!userId) {
      return sendError(res, "Invalid user_id", null, 400);
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (userRows.length === 0) {
      return sendError(res, "User not found for this account", null, 404);
    }

    const [duplicateAccountRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_number = ?",
      [account_number]
    );
    if (duplicateAccountRows.length > 0) {
      return sendError(res, "Account number already exists", null, 400);
    }

    const accountBalance =
      balance === undefined || balance === null || balance === "" ? 0 : Number(balance);
    if (Number.isNaN(accountBalance)) {
      return sendError(res, "Invalid balance value", null, 400);
    }

    const [insertResult] = await pool.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, account_number, account_type, accountBalance, created_at || null]
    );

    const [createdAccount] = await pool.query(
      "SELECT * FROM accounts WHERE account_id = ?",
      [insertResult.insertId]
    );

    return sendSuccess(res, "Account created successfully", createdAccount[0], 201);
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

    const { user_id, account_number, account_type, balance, created_at } = req.body;

    if (!user_id || !account_number || !account_type) {
      return sendError(
        res,
        "user_id, account_number and account_type are required",
        null,
        400
      );
    }

    const userId = parseId(user_id);
    if (!userId) {
      return sendError(res, "Invalid user_id", null, 400);
    }

    const [accountRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_id = ?",
      [accountId]
    );
    if (accountRows.length === 0) {
      return sendError(res, "Account not found", null, 404);
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (userRows.length === 0) {
      return sendError(res, "User not found for this account", null, 404);
    }

    const [duplicateAccountRows] = await pool.query(
      "SELECT account_id FROM accounts WHERE account_number = ? AND account_id != ?",
      [account_number, accountId]
    );
    if (duplicateAccountRows.length > 0) {
      return sendError(res, "Account number already exists", null, 400);
    }

    const accountBalance =
      balance === undefined || balance === null || balance === "" ? 0 : Number(balance);
    if (Number.isNaN(accountBalance)) {
      return sendError(res, "Invalid balance value", null, 400);
    }

    await pool.query(
      `UPDATE accounts
       SET user_id = ?, account_number = ?, account_type = ?, balance = ?, created_at = ?
       WHERE account_id = ?`,
      [userId, account_number, account_type, accountBalance, created_at || null, accountId]
    );

    const [updatedAccount] = await pool.query(
      "SELECT * FROM accounts WHERE account_id = ?",
      [accountId]
    );

    return sendSuccess(res, "Account updated successfully", updatedAccount[0]);
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

    const [deleteResult] = await pool.query("DELETE FROM accounts WHERE account_id = ?", [
      accountId,
    ]);
    if (deleteResult.affectedRows === 0) {
      return sendError(res, "Account not found", null, 404);
    }

    return sendSuccess(res, "Account deleted successfully", {
      account_id: accountId,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};
