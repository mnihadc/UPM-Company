import express from "express";
import {
  createLeaveApplication,
  downloadSalesUserExcel,
  downloadSalesUserPDF,
  getLeave,
  getLeaveApplications,
  updateLeaveApplication,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-leave", verifyToken, createLeaveApplication);
router.get("/get-leave", verifyToken, getLeave);
router.get("/leave-applications-admin", getLeaveApplications);
router.put("/leave-applications/:id/status", updateLeaveApplication);
router.get(
  "/dowload-user-sales-excel/:saleId",
  verifyToken,
  downloadSalesUserExcel
);
router.get(
  "/dowload-user-sales-pdf/:saleId",
  verifyToken,
  downloadSalesUserPDF
);

export default router;
