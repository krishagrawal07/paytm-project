import express from "express";
import {
  topUsersTransactions,
  usersWithPayments,
  amazonTransactions2023,
  userEmailTransaction,
  merchantsNoTransactions,
  zomatoUsers,
  ecommerceUsers,
  highestAverageMerchant,
  usersMoreThan5Payments,
  merchantCommission,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/top-users-transactions", topUsersTransactions);
router.get("/users-with-payments", usersWithPayments);
router.get("/amazon-transactions-2023", amazonTransactions2023);
router.get("/user-email-transaction", userEmailTransaction);
router.get("/merchants-no-transactions", merchantsNoTransactions);
router.get("/zomato-users", zomatoUsers);
router.get("/ecommerce-users", ecommerceUsers);
router.get("/highest-average-merchant", highestAverageMerchant);
router.get("/users-more-than-5-payments", usersMoreThan5Payments);
router.get("/merchant-commission", merchantCommission);

export default router;
