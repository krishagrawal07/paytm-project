const pool = require("../config/db");
const { sendSuccess, sendError } = require("../middleware/errorMiddleware");

const parseId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
};

const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query("SELECT * FROM users ORDER BY user_id DESC");
    return sendSuccess(res, "Users fetched successfully", users);
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

    const [users] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (users.length === 0) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User fetched successfully", users[0]);
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, address, city, state, country } =
      req.body;

    if (!first_name || !last_name || !email || !phone) {
      return sendError(
        res,
        "first_name, last_name, email and phone are required",
        null,
        400
      );
    }

    const [existingUsers] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    const [insertResult] = await pool.query(
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

    const [createdUser] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      insertResult.insertId,
    ]);

    return sendSuccess(res, "User created successfully", createdUser[0], 201);
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

    const { first_name, last_name, email, phone, address, city, state, country } =
      req.body;

    if (!first_name || !last_name || !email || !phone) {
      return sendError(
        res,
        "first_name, last_name, email and phone are required",
        null,
        400
      );
    }

    const [userRows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (userRows.length === 0) {
      return sendError(res, "User not found", null, 404);
    }

    const [duplicateEmailRows] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
      [email, userId]
    );
    if (duplicateEmailRows.length > 0) {
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

    const [updatedUser] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      userId,
    ]);

    return sendSuccess(res, "User updated successfully", updatedUser[0]);
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

    const [deleteResult] = await pool.query("DELETE FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (deleteResult.affectedRows === 0) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User deleted successfully", { user_id: userId });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
