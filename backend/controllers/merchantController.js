const pool = require("../config/db");
const { sendSuccess, sendError } = require("../middleware/errorMiddleware");

const parseId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
};

const getAllMerchants = async (req, res, next) => {
  try {
    const [merchants] = await pool.query(
      "SELECT * FROM merchants ORDER BY merchant_id DESC"
    );
    return sendSuccess(res, "Merchants fetched successfully", merchants);
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

    const [merchants] = await pool.query(
      "SELECT * FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );
    if (merchants.length === 0) {
      return sendError(res, "Merchant not found", null, 404);
    }

    return sendSuccess(res, "Merchant fetched successfully", merchants[0]);
  } catch (error) {
    return next(error);
  }
};

const createMerchant = async (req, res, next) => {
  try {
    const { merchant_name, category, email, phone, address } = req.body;

    if (!merchant_name || !category || !email) {
      return sendError(
        res,
        "merchant_name, category and email are required",
        null,
        400
      );
    }

    const [existingMerchants] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE email = ?",
      [email]
    );
    if (existingMerchants.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    const [insertResult] = await pool.query(
      `INSERT INTO merchants (merchant_name, category, email, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [merchant_name, category, email, phone || null, address || null]
    );

    const [createdMerchant] = await pool.query(
      "SELECT * FROM merchants WHERE merchant_id = ?",
      [insertResult.insertId]
    );

    return sendSuccess(
      res,
      "Merchant created successfully",
      createdMerchant[0],
      201
    );
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

    const { merchant_name, category, email, phone, address } = req.body;

    if (!merchant_name || !category || !email) {
      return sendError(
        res,
        "merchant_name, category and email are required",
        null,
        400
      );
    }

    const [merchantRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );
    if (merchantRows.length === 0) {
      return sendError(res, "Merchant not found", null, 404);
    }

    const [duplicateEmailRows] = await pool.query(
      "SELECT merchant_id FROM merchants WHERE email = ? AND merchant_id != ?",
      [email, merchantId]
    );
    if (duplicateEmailRows.length > 0) {
      return sendError(res, "Email already exists", null, 400);
    }

    await pool.query(
      `UPDATE merchants
       SET merchant_name = ?, category = ?, email = ?, phone = ?, address = ?
       WHERE merchant_id = ?`,
      [merchant_name, category, email, phone || null, address || null, merchantId]
    );

    const [updatedMerchant] = await pool.query(
      "SELECT * FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );

    return sendSuccess(res, "Merchant updated successfully", updatedMerchant[0]);
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

    const [deleteResult] = await pool.query(
      "DELETE FROM merchants WHERE merchant_id = ?",
      [merchantId]
    );
    if (deleteResult.affectedRows === 0) {
      return sendError(res, "Merchant not found", null, 404);
    }

    return sendSuccess(res, "Merchant deleted successfully", {
      merchant_id: merchantId,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};
