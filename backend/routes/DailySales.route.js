import express from "express";
import {
  createDailySales,
  dailySales,
  getTodaySales,
  updateDailySales,
} from "../controllers/DailySales.controller.js";
import verifyUser from "../utils/verifyUser.js";

const router = express.Router();

router.get("/today-sales/:userId", getTodaySales);
router.post("/daily-sales", createDailySales);
router.put("/daily-sales", updateDailySales);
router.get("/get-daily-sales", dailySales);

export default router;
