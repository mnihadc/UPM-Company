import express from "express";
import {
  deleteUser,
  getMonthlyProfit,
  getMonthlySales,
  getUsers,
  updateEmployeeVerify,
} from "../controllers/AdminUserManagement.js";

const router = express.Router();

router.get("/get-users", getUsers);
router.put("/update-employee-verify/:id", updateEmployeeVerify);
router.delete("/delete-user/:id", deleteUser);
router.get("/profit-chart", getMonthlyProfit);
router.get("/admin-sales-data", getMonthlySales);

export default router;
