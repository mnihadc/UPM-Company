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
