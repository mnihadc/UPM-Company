import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import validator from "validator";

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
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
