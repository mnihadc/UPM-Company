import express from "express";
import {
  createDailySales,
  getTodaySales,
  updateDailySales,
} from "../controllers/DailySales.controller.js";

const router = express.Router();

router.get("/today-sales/:userId", getTodaySales);
router.post("/daily-sales", createDailySales);
router.put("/daily-sales", updateDailySales);

export default router;
