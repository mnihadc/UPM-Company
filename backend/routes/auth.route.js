import express from "express";
import {
  getUserProfile,
  getVerifyEmailPage,
  loginUser,
  logoutUser,
  resendOtp,
  sendOtpToEmail,
  signUp,
  verifyEmailOtp,
  verifyOtp,
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
router.post("/verifyOtp", verifyOtp);
router.get("/profile", getUserProfile);

export default router;
