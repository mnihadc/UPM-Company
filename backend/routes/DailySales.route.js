import express from "express";
import {
  createDailySales,
  dailySales,
  getDailySalesChart,
  getTodaySales,
  updateDailySales,
} from "../controllers/DailySales.controller.js";

const router = express.Router();

router.get("/today-sales/:userId", getTodaySales);
router.post("/daily-sales", createDailySales);
router.put("/daily-sales", updateDailySales);
router.get("/get-daily-sales", dailySales);
router.get("/daily-sales-chart", getDailySalesChart);

export default router;
