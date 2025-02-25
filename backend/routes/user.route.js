import express from "express";
import { createLeaveApplication } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-leave", verifyToken, createLeaveApplication);

export default router;
