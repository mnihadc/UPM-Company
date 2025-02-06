import express from "express";
import {
  getVerifyEmailPage,
  loginUser,
  resendOtp,
  signUp,
  verifyEmailOtp,
} from "../controllers/Auth.controller.js";

const router = express.Router();

// POST route for user sign-up
router.post("/signup", signUp);
router.get("/email-verify", getVerifyEmailPage);
router.post("/verify-email", verifyEmailOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);

export default router;
