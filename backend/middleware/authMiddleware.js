import jwt from "jsonwebtoken";
import { sendError } from "./errorMiddleware.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized: token is missing", null, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = decoded;
    return next();
  } catch (error) {
    return sendError(res, "Unauthorized: invalid or expired token", null, 401);
  }
};

export default authMiddleware;
