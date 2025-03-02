import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { userPerformance } from "../controllers/data.controller.js";

const router = express.Router();

router.get("/generate-pdf-user-performance", verifyToken, userPerformance);

export default router;
