import pool from "../config/db.js";
import { sendSuccess, sendError } from "../middleware/errorMiddleware.js";

const parseId = (id) => {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getAllMerchants = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM merchants ORDER BY merchant_id DESC");
    return sendSuccess(res, "Merchants fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const getMerchantById = async (req, res, next) => {
  try {
    const merchantId = parseId(req.params.id);
    if (!merchantId) {
      return sendError(res, "Invalid merchant ID", null, 400);
    }

    const [rows] = await pool.query("SELECT * FROM merchants WHERE merchant_id = ?", [merchantId]);
    if (!rows.length) {
      return sendError(res, "Merchant not found", null, 404);
    }

    return sendSuccess(res, "Merchant fetched successfully", rows[0]);
  } catch (error) {
    return next(error);
  }
};

const createMerchant = async (req, res, next) => {
  try {
    const merchant_name = normalizeText(req.body?.merchant_name);
    const category = normalizeText(req.body?.category);
    const email = normalizeText(req.body?.email).toLowerCase();
    const phone = normalizeText(req.body?.phone);
    const address = normalizeText(req.body?.address);

    if (!merchant_name || !category || !email) {
      return sendError(res, "merchant_name, category and email are required", null, 400);
    }

    if (!isEmailValid(email)) {
      return sendError(res, "Please provide a valid email", null, 400);
    }

    const [duplicateRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE email = ?",
      [email]
    );
    if (duplicateRows.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO merchants (merchant_name, category, email, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [merchant_name, category, email, phone || null, address || null]
    );

    const [createdRows] = await pool.query("SELECT * FROM merchants WHERE merchant_id = ?", [result.insertId]);
    return sendSuccess(res, "Merchant created successfully", createdRows[0], 201);
  } catch (error) {
    return next(error);
  }
};

const updateMerchant = async (req, res, next) => {
  try {
    const merchantId = parseId(req.params.id);
    if (!merchantId) {
      return sendError(res, "Invalid merchant ID", null, 400);
    }

    const merchant_name = normalizeText(req.body?.merchant_name);
    const category = normalizeText(req.body?.category);
    const email = normalizeText(req.body?.email).toLowerCase();
    const phone = normalizeText(req.body?.phone);
    const address = normalizeText(req.body?.address);

    if (!merchant_name || !category || !email) {
      return sendError(res, "merchant_name, category and email are required", null, 400);
    }

    if (!isEmailValid(email)) {
      return sendError(res, "Please provide a valid email", null, 400);
    }

    const [existingRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );
    if (!existingRows.length) {
      return sendError(res, "Merchant not found", null, 404);
    }

    const [duplicateRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE email = ? AND merchant_id != ?",
      [email, merchantId]
    );
    if (duplicateRows.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    await pool.query(
      `UPDATE merchants
       SET merchant_name = ?, category = ?, email = ?, phone = ?, address = ?
       WHERE merchant_id = ?`,
      [merchant_name, category, email, phone || null, address || null, merchantId]
    );

    const [updatedRows] = await pool.query("SELECT * FROM merchants WHERE merchant_id = ?", [merchantId]);
    return sendSuccess(res, "Merchant updated successfully", updatedRows[0]);
  } catch (error) {
    return next(error);
  }
};

const deleteMerchant = async (req, res, next) => {
  try {
    const merchantId = parseId(req.params.id);
    if (!merchantId) {
      return sendError(res, "Invalid merchant ID", null, 400);
    }

    const [result] = await pool.query("DELETE FROM merchants WHERE merchant_id = ?", [merchantId]);
    if (result.affectedRows === 0) {
      return sendError(res, "Merchant not found", null, 404);
    }

    return sendSuccess(res, "Merchant deleted successfully", { merchant_id: merchantId });
  } catch (error) {
    return next(error);
  }
};

export { getAllMerchants, getMerchantById, createMerchant, updateMerchant, deleteMerchant };
