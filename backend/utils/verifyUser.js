import jwt from "jsonwebtoken";
import User from "../models/User.model.js"; // Assuming User model exists

// Middleware to verify user authentication and check verification status
const verifyUser = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database based on the decoded userId from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is verified and if the employee is verified
    if (!user.email_verify) {
      return res
        .status(403)
        .json({ message: "Please verify your email to access this resource." });
    }

    if (!user.employee_verify) {
      return res
        .status(403)
        .json({ message: "Your account has not been verified by the admin." });
    }

    // Attach the user object to the request so it can be accessed in subsequent routes
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

export default verifyUser;
