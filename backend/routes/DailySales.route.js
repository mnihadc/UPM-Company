import express from "express";
import {
  createDailySales,
  dailySales,
  getTodaySales,
  updateDailySales,
} from "../controllers/DailySales.controller.js";

const router = express.Router();

router.get("/today-sales/:userId", getTodaySales);
router.post("/daily-sales", createDailySales);
router.put("/daily-sales", updateDailySales);
router.get("/daily-sales", dailySales);

export default router;
