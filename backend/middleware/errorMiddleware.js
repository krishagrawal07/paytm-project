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
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, null, 404);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.type === "entity.parse.failed") {
    return sendError(res, "Invalid JSON body", err.message, 400);
  }

  if (err?.code === "ER_DUP_ENTRY") {
    return sendError(res, "Duplicate value found", err.sqlMessage, 400);
  }

  if (err?.code === "ER_NO_REFERENCED_ROW_2") {
    return sendError(res, "Referenced record does not exist", err.sqlMessage, 400);
  }

  if (err?.code === "ER_ROW_IS_REFERENCED_2") {
    return sendError(
      res,
      "Cannot delete this record because it is referenced by other records",
      err.sqlMessage,
      409
    );
  }

  if (err?.message === "Not allowed by CORS") {
    return sendError(res, "CORS error: origin not allowed", null, 403);
  }

  if (err?.code && err.code.startsWith("ER_")) {
    return sendError(res, "Database error", err.sqlMessage, 500);
  }

  return sendError(
    res,
    err?.message || "Internal server error",
    process.env.NODE_ENV === "production" ? null : err?.stack,
    err?.statusCode || 500
  );
};

export { sendSuccess, sendError, notFound, errorHandler };
