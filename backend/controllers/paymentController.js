import pool from "../config/db.js";
import { sendSuccess, sendError } from "../middleware/errorMiddleware.js";

const parseId = (id) => {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getAllPayments = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM payments ORDER BY payment_id DESC");
    return sendSuccess(res, "Payments fetched successfully", rows);
  } catch (error) {
    return next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const paymentId = parseId(req.params.id);
    if (!paymentId) {
      return sendError(res, "Invalid payment ID", null, 400);
    }

    const [rows] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [paymentId]);
    if (!rows.length) {
      return sendError(res, "Payment not found", null, 404);
    }

    return sendSuccess(res, "Payment fetched successfully", rows[0]);
  } catch (error) {
    return next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const transactionId = parseId(req.body?.transaction_id);
    const payment_method = normalizeText(req.body?.payment_method);
    const payment_status = normalizeText(req.body?.payment_status);
    const payment_date = normalizeText(req.body?.payment_date);

    if (!transactionId || !payment_method || !payment_status || !payment_date) {
      return sendError(
        res,
        "transaction_id, payment_method, payment_status and payment_date are required",
        null,
        400
      );
    }

    if (!dateRegex.test(payment_date)) {
      return sendError(res, "payment_date must be in YYYY-MM-DD format", null, 400);
    }

    const [transactionRows] = await pool.query(
      "SELECT transaction_id FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (!transactionRows.length) {
      return sendError(res, "Transaction not found for this payment", null, 404);
    }

    const [result] = await pool.query(
      `INSERT INTO payments (transaction_id, payment_method, payment_status, payment_date)
       VALUES (?, ?, ?, ?)`,
      [transactionId, payment_method, payment_status, payment_date]
    );

    const [createdRows] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [result.insertId]);
    return sendSuccess(res, "Payment created successfully", createdRows[0], 201);
  } catch (error) {
    return next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const paymentId = parseId(req.params.id);
    if (!paymentId) {
      return sendError(res, "Invalid payment ID", null, 400);
    }

    const transactionId = parseId(req.body?.transaction_id);
    const payment_method = normalizeText(req.body?.payment_method);
    const payment_status = normalizeText(req.body?.payment_status);
    const payment_date = normalizeText(req.body?.payment_date);

    if (!transactionId || !payment_method || !payment_status || !payment_date) {
      return sendError(
        res,
        "transaction_id, payment_method, payment_status and payment_date are required",
        null,
        400
      );
    }

    if (!dateRegex.test(payment_date)) {
      return sendError(res, "payment_date must be in YYYY-MM-DD format", null, 400);
    }

    const [paymentRows] = await pool.query("SELECT payment_id FROM payments WHERE payment_id = ?", [paymentId]);
    if (!paymentRows.length) {
      return sendError(res, "Payment not found", null, 404);
    }

    const [transactionRows] = await pool.query(
      "SELECT transaction_id FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (!transactionRows.length) {
      return sendError(res, "Transaction not found for this payment", null, 404);
    }

    await pool.query(
      `UPDATE payments
       SET transaction_id = ?, payment_method = ?, payment_status = ?, payment_date = ?
       WHERE payment_id = ?`,
      [transactionId, payment_method, payment_status, payment_date, paymentId]
    );

    const [updatedRows] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [paymentId]);
    return sendSuccess(res, "Payment updated successfully", updatedRows[0]);
  } catch (error) {
    return next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const paymentId = parseId(req.params.id);
    if (!paymentId) {
      return sendError(res, "Invalid payment ID", null, 400);
    }

    const [result] = await pool.query("DELETE FROM payments WHERE payment_id = ?", [paymentId]);
    if (result.affectedRows === 0) {
      return sendError(res, "Payment not found", null, 404);
    }

    return sendSuccess(res, "Payment deleted successfully", { payment_id: paymentId });
  } catch (error) {
    return next(error);
  }
};

export { getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment };
