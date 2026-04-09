const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../middleware/errorMiddleware");

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", null, 400);
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@paytm.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    const isEmailValid = email.toLowerCase() === adminEmail.toLowerCase();
    let isPasswordValid = password === adminPassword;

    if (!isPasswordValid && adminPasswordHash) {
      isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    }

    if (!isEmailValid || !isPasswordValid) {
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

module.exports = {
  loginAdmin,
};
