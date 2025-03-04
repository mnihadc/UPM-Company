import express from "express";
import {
  createDailySales,
  creditUser,
  dailySales,
  deleteOldSales,
  getDailySalesChart,
  getLeaderboard,
  getTodaySales,
  updateCredit,
  updateDailySales,
} from "../controllers/DailySales.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/today-sales/:userId", getTodaySales);
router.post("/daily-sales", createDailySales);
router.put("/daily-sales", updateDailySales);
router.get("/get-daily-sales", verifyToken, dailySales);
router.get("/daily-sales-chart", getDailySalesChart);
router.get("/users-credits", creditUser);
router.put("/update-credit/:id", updateCredit);
router.get("/leaderboard", getLeaderboard);
router.delete("/delete-old-sales", deleteOldSales);

export default router;
