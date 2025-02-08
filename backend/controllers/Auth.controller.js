import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import validator from "validator";
import nodemailer from "nodemailer";
import crypto from "crypto"; // For generating OTPs
// Helper function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// SignUp Controller
export const signUp = async (req, res) => {
  const { username, age, role, email, password, mobile, gender, avatar } =
    req.body;

  try {
    // Basic validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Password Validation: Ensure password is at least 6 characters (already handled by Mongoose schema)
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role Validation
    const validRoles = [
      "Manager Senior",
      "Manager Junior",
      "Sales Executive Senior",
      "Sales Executive Junior",
      "Technician",
      "Office Staff",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Avatar Validation (if you want to check for a valid image URL)
    if (avatar && !validator.isURL(avatar)) {
      return res.status(400).json({ message: "Invalid avatar URL" });
    }

    // Generate OTP
    const otp = generateOtp();

    // Create new user object
    const newUser = new User({
      username,
      age,
      role,
      email,
      password: hashedPassword,
      mobile,
      gender,
      avatar: avatar || "", // Default to empty string if no avatar
      isAdmin: false,
      otp, // Store OTP in the user object (you can store it in a separate collection or cache if preferred)
      otpExpires: Date.now() + 3600000, // OTP expiry time (1 hour)
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any other email service
      auth: {
        user: process.env.EMAIL_USER, // Your email user
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    // Compose the email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email user
      to: email, // Recipient's email
      subject: "Your Email Verification OTP By UPM Company",
      text: `Your OTP for email verification is: ${otp}`, // Plain text version
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: auto; background: #f4f4f4; padding: 20px; border-radius: 8px; }
              .otp { font-size: 24px; font-weight: bold; color: #4070f4; text-align: center; }
              .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to UPM Company!</h2>
              <p>We received a request to verify your email address. Please use the OTP below to complete the process:</p>
              <div class="otp">${otp}</div>
              <p class="footer">If you didn't request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `, // HTML version
    };
    // Send OTP email
    await transporter.sendMail(mailOptions);

    // Generate JWT Token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Set cookie with JWT
    res.cookie("authToken", token, {
      httpOnly: true, // Prevent client-side JavaScript from accessing it
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    // Redirect to email verification page with the token
    res.status(201).json({
      message: "User created successfully. Check your email for OTP.",
      user: savedUser,
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVerifyEmailPage = (req, res) => {
  try {
    const token =
      req.cookies.authToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ email: decoded.email });
  } catch (error) {
    console.error("Error decoding token:", error);
    return res.status(500).json({ error: "Error decoding the token." });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    // Extract the token from request cookies or headers
    const token =
      req.cookies.authToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email; // Extract email from token

    // Find the user in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract OTP from request body
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    // Check if the OTP matches (convert both to strings)
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark the user as verified
    user.otp = null; // Remove OTP after successful verification
    user.email_verify = true; // Assuming you have an `isVerified` field in your schema
    await user.save();

    // Clear token and cookies
    res.clearCookie("authToken");

    res
      .status(200)
      .json({ message: "Email verified successfully, redirecting to login." });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Resend OTP Controller
export const resendOtp = async (req, res) => {
  try {
    const token =
      req.cookies.authToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const newOtp = generateOtp();
    user.otp = newOtp;
    await user.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content

    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email user
      to: user.email.trim(), // Recipient's email
      subject: "Your Email Verification OTP By UPM Company",
      text: `Your OTP for email verification is: ${newOtp}`, // Plain text version
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: auto; background: #f4f4f4; padding: 20px; border-radius: 8px; }
              .otp { font-size: 24px; font-weight: bold; color: #4070f4; text-align: center; }
              .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to UPM Company!</h2>
              <p>Resend OTP NEW ONE</p>
              <p>We received a request to verify your email address. Please use the OTP below to complete the process:</p>
              <div class="otp">${newOtp}</div>
              <p class="footer">If you didn't request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `, // HTML version
    };
    // Send Email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ message: "Error resending OTP" });
  }
};

// Controller function for user login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Check if email is verified
    if (!user.email_verify) {
      return res
        .status(403)
        .json({ message: "Please verify your email to login." });
    }

    // Check if user is admin or employee verified
    if (!user.employee_verify) {
      return res.status(403).json({
        message:
          "Your account is not verified by the admin. Please contact to admin",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store token in httpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: "strict",
    });

    // Send only necessary user details to Redux
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie("session", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Logout failed", error: error.message });
  }
};

export const sendOtpToEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update user record with OTP
    user.otp = hashedOtp;
    user.otpExpire = expiresAt;
    await user.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content

    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email user
      to: user.email.trim(), // Recipient's email
      subject: "Your Forgot password OTP By UPM Company",
      text: `Your OTP for Forgot Password is: ${otp}`, // Plain text version
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: auto; background: #f4f4f4; padding: 20px; border-radius: 8px; }
              .otp { font-size: 24px; font-weight: bold; color: #4070f4; text-align: center; }
              .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to UPM Company!</h2>
              <p>We received a request to forgotpassword otp to your email address. Please use the OTP below to complete the process:</p>
              <div class="otp">${otp}</div>
              <p class="footer">If you didn't request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `, // HTML version
    };
    // Send Email
    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is expired
    if (user.otpExpire < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP after verification
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
