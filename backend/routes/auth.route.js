import express from "express";
import {
  getVerifyEmailPage,
  signUp,
  verifyEmailOtp,
} from "../controllers/Auth.controller.js";

const router = express.Router();

// POST route for user sign-up
router.post("/signup", signUp);
router.get("/email-verify", getVerifyEmailPage);
router.post("/verify-email", verifyEmailOtp);

export default router;
