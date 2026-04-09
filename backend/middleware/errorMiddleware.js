const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
};

const sendError = (res, message, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error,
  });
};

const notFound = (req, res) => {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    null,
    404
  );
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err && err.code === "ER_DUP_ENTRY") {
    return sendError(res, "Duplicate value found", err.sqlMessage, 400);
  }

  if (err && err.code && err.code.startsWith("ER_")) {
    return sendError(res, "Database error", err.sqlMessage, 500);
  }

  return sendError(
    res,
    err.message || "Internal server error",
    process.env.NODE_ENV === "production" ? null : err.stack,
    err.statusCode || 500
  );
};

module.exports = {
  sendSuccess,
  sendError,
  notFound,
  errorHandler,
};
