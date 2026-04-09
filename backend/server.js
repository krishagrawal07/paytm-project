const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const pool = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const { notFound, errorHandler, sendSuccess } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return sendSuccess(res, "Paytm DBMS backend is running", {
    health: "ok",
  });
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
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();
