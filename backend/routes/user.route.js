import express from "express";
import upload from "../utils/multerConfig.js";
import {
  createLeaveApplication,
  downloadSalesUserExcel,
  downloadSalesUserPDF,
  generateAdminDailySalesExcel,
  generateAdminDailySalesPDF,
  getLeave,
  getLeaveApplications,
  updateLeaveApplication,
  updateProfileImage,
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

router.get("/admin-daily-sales-pdf/:saleId", generateAdminDailySalesPDF);
router.get("/admin-daily-sales-excel/:saleId", generateAdminDailySalesExcel);
router.put(
  "/upload-profile",
  verifyToken,
  upload.single("image"),
  updateProfileImage
);


export default router;
