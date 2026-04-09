const pool = require("../config/db");
const { sendSuccess, sendError } = require("../middleware/errorMiddleware");

const parseId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
};

const getAllPayments = async (req, res, next) => {
  try {
    const [payments] = await pool.query("SELECT * FROM payments ORDER BY payment_id DESC");
    return sendSuccess(res, "Payments fetched successfully", payments);
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

    const [payments] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [
      paymentId,
    ]);
    if (payments.length === 0) {
      return sendError(res, "Payment not found", null, 404);
    }

    return sendSuccess(res, "Payment fetched successfully", payments[0]);
  } catch (error) {
    return next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { transaction_id, payment_method, payment_status, payment_date } = req.body;

    if (!transaction_id || !payment_method || !payment_status || !payment_date) {
      return sendError(
        res,
        "transaction_id, payment_method, payment_status and payment_date are required",
        null,
        400
      );
    }

    const transactionId = parseId(transaction_id);
    if (!transactionId) {
      return sendError(res, "Invalid transaction_id", null, 400);
    }

    const [transactionRows] = await pool.query(
      "SELECT transaction_id FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (transactionRows.length === 0) {
      return sendError(res, "Transaction not found for this payment", null, 404);
    }

    const [insertResult] = await pool.query(
      `INSERT INTO payments (transaction_id, payment_method, payment_status, payment_date)
       VALUES (?, ?, ?, ?)`,
      [transactionId, payment_method, payment_status, payment_date]
    );

    const [createdPayment] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [
      insertResult.insertId,
    ]);

    return sendSuccess(res, "Payment created successfully", createdPayment[0], 201);
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

    const { transaction_id, payment_method, payment_status, payment_date } = req.body;

    if (!transaction_id || !payment_method || !payment_status || !payment_date) {
      return sendError(
        res,
        "transaction_id, payment_method, payment_status and payment_date are required",
        null,
        400
      );
    }

    const transactionId = parseId(transaction_id);
    if (!transactionId) {
      return sendError(res, "Invalid transaction_id", null, 400);
    }

    const [paymentRows] = await pool.query("SELECT payment_id FROM payments WHERE payment_id = ?", [
      paymentId,
    ]);
    if (paymentRows.length === 0) {
      return sendError(res, "Payment not found", null, 404);
    }

    const [transactionRows] = await pool.query(
      "SELECT transaction_id FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );
    if (transactionRows.length === 0) {
      return sendError(res, "Transaction not found for this payment", null, 404);
    }

    await pool.query(
      `UPDATE payments
       SET transaction_id = ?, payment_method = ?, payment_status = ?, payment_date = ?
       WHERE payment_id = ?`,
      [transactionId, payment_method, payment_status, payment_date, paymentId]
    );

    const [updatedPayment] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [
      paymentId,
    ]);

    return sendSuccess(res, "Payment updated successfully", updatedPayment[0]);
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

    const [deleteResult] = await pool.query("DELETE FROM payments WHERE payment_id = ?", [
      paymentId,
    ]);
    if (deleteResult.affectedRows === 0) {
      return sendError(res, "Payment not found", null, 404);
    }

    return sendSuccess(res, "Payment deleted successfully", { payment_id: paymentId });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
