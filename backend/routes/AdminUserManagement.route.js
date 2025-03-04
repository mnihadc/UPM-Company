import express from "express";
import {
  adminSalesUserChart,
  deleteUser,
  GetAdminDailySales,
  getAdminUserCredits,
  getAdminUserExpenses,
  getAdminUserProfit,
  getCreditReport,
  getMonthlyProfit,
  getMonthlySales,
  getTotalExpenseData,
  getUsers,
  updateEmployeeVerify,
} from "../controllers/AdminUserManagement.js";

const router = express.Router();

router.get("/get-users", getUsers);
router.put("/update-employee-verify/:id", updateEmployeeVerify);
router.delete("/delete-user/:id", deleteUser);
router.get("/profit-chart", getMonthlyProfit);
router.get("/admin-sales-data", getMonthlySales);
router.get("/credit-data", getCreditReport);
router.get("/expense-data", getTotalExpenseData);
router.get("/admin-sales-user", adminSalesUserChart);
router.get("/admin-profit-user", getAdminUserProfit);
router.get("/admin-expense-user", getAdminUserExpenses);
router.get("/admin-credit-user", getAdminUserCredits);
router.get("/get-admin-daily-sales-data", GetAdminDailySales);

export default router;
