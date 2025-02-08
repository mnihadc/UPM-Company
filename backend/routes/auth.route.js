import express from "express";
import {
  getVerifyEmailPage,
  loginUser,
  logoutUser,
  resendOtp,
  sendOtpToEmail,
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
router.post("/logout", logoutUser);
router.post("/forgotpassword-email", sendOtpToEmail);

export default router;
