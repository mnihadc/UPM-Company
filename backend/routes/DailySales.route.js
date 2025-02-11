import express from "express";
import { createDailySales } from "../controllers/DailySales.controller.js";
import verifyUser from "../utils/verifyUser.js";

const router = express.Router();

router.post("/daily-sales", createDailySales);

export default router;
