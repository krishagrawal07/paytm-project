const jwt = require("jsonwebtoken");
const { sendError } = require("./errorMiddleware");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized: token is missing", null, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return sendError(res, "Unauthorized: invalid or expired token", null, 401);
  }
};

module.exports = authMiddleware;
