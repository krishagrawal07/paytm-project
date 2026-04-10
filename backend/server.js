import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/db.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { notFound, errorHandler, sendSuccess } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import merchantRoutes from "./routes/merchantRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  return sendSuccess(res, "Paytm DBMS backend is running", { health: "ok" });
});

app.get("/api/health/db", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS db_name");
    return sendSuccess(res, "Database connection is healthy", {
      db_name: rows[0]?.db_name || process.env.DB_NAME || "paytm_db",
    });
  } catch (error) {
    return next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/merchants", authMiddleware, merchantRoutes);
app.use("/api/accounts", authMiddleware, accountRoutes);
app.use("/api/transactions", authMiddleware, transactionRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT DATABASE() AS db_name");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Connected to MySQL database: ${rows[0]?.db_name || process.env.DB_NAME || "paytm_db"}`);
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();
