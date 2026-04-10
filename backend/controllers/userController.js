import pool from "../config/db.js";
import { sendSuccess, sendError } from "../middleware/errorMiddleware.js";

const parseId = (id) => {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY user_id DESC");
    return sendSuccess(res, "Users fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = parseId(req.params.id);
    if (!userId) {
      return sendError(res, "Invalid user ID", null, 400);
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    if (!rows.length) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User fetched successfully", rows[0]);
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const first_name = normalizeText(req.body?.first_name);
    const last_name = normalizeText(req.body?.last_name);
    const email = normalizeText(req.body?.email).toLowerCase();
    const phone = normalizeText(req.body?.phone);
    const address = normalizeText(req.body?.address);
    const city = normalizeText(req.body?.city);
    const state = normalizeText(req.body?.state);
    const country = normalizeText(req.body?.country);

    if (!first_name || !last_name || !email || !phone) {
      return sendError(res, "first_name, last_name, email and phone are required", null, 400);
    }

    if (!isEmailValid(email)) {
      return sendError(res, "Please provide a valid email", null, 400);
    }

    const [duplicateRows] = await pool.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (duplicateRows.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, address, city, state, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        address || null,
        city || null,
        state || null,
        country || null,
      ]
    );

    const [createdRows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [result.insertId]);
    return sendSuccess(res, "User created successfully", createdRows[0], 201);
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = parseId(req.params.id);
    if (!userId) {
      return sendError(res, "Invalid user ID", null, 400);
    }

    const first_name = normalizeText(req.body?.first_name);
    const last_name = normalizeText(req.body?.last_name);
    const email = normalizeText(req.body?.email).toLowerCase();
    const phone = normalizeText(req.body?.phone);
    const address = normalizeText(req.body?.address);
    const city = normalizeText(req.body?.city);
    const state = normalizeText(req.body?.state);
    const country = normalizeText(req.body?.country);

    if (!first_name || !last_name || !email || !phone) {
      return sendError(res, "first_name, last_name, email and phone are required", null, 400);
    }

    if (!isEmailValid(email)) {
      return sendError(res, "Please provide a valid email", null, 400);
    }

    const [existingRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [userId]);
    if (!existingRows.length) {
      return sendError(res, "User not found", null, 404);
    }

    const [duplicateRows] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
      [email, userId]
    );
    if (duplicateRows.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    await pool.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, country = ?
       WHERE user_id = ?`,
      [
        first_name,
        last_name,
        email,
        phone,
        address || null,
        city || null,
        state || null,
        country || null,
        userId,
      ]
    );

    const [updatedRows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    return sendSuccess(res, "User updated successfully", updatedRows[0]);
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = parseId(req.params.id);
    if (!userId) {
      return sendError(res, "Invalid user ID", null, 400);
    }

    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [userId]);
    if (result.affectedRows === 0) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User deleted successfully", { user_id: userId });
  } catch (error) {
    return next(error);
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
