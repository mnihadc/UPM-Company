import express from "express";
import {
  createLeaveApplication,
  getLeave,
  getLeaveApplications,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-leave", verifyToken, createLeaveApplication);
router.get("/get-leave", verifyToken, getLeave);
router.get("/leave-applications-admin", getLeaveApplications);

export default router;
