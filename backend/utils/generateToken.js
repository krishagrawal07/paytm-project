import jwt from "jsonwebtoken";

const generateToken = (email) => {
  const jwtSecret = process.env.JWT_SECRET || "supersecretkey";
  return jwt.sign({ email, role: "admin" }, jwtSecret, { expiresIn: "1d" });
};

export default generateToken;
