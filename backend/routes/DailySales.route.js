import express from "express";
import {
  createDailySales,
  getTodaySales,
} from "../controllers/DailySales.controller.js";

const router = express.Router();

router.get("/today-sales/:userId", getTodaySales);
router.post("/daily-sales", createDailySales);

export default router;
