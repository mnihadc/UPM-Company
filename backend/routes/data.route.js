import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  AdminPerformancepdf,
  userPerformance,
} from "../controllers/data.controller.js";

const router = express.Router();

router.get("/generate-pdf-user-performance", verifyToken, userPerformance);
router.get("/generate-pdf-admin-performance", AdminPerformancepdf);

export default router;
