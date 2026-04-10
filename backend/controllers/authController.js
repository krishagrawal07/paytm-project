import generateToken from "../utils/generateToken.js";
import { sendSuccess, sendError } from "../middleware/errorMiddleware.js";

const loginAdmin = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password.trim() : "";

    if (!email || !password) {
      return sendError(res, "Email and password are required", null, 400);
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@paytm.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
      return sendError(res, "Invalid admin credentials", null, 401);
    }

    const token = generateToken(adminEmail);

    return sendSuccess(
      res,
      "Login successful",
      {
        token,
        email: adminEmail,
      },
      200
    );
  } catch (error) {
    return next(error);
  }
};

export { loginAdmin };
