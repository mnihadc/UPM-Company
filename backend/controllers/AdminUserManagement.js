import User from "../models/User.model.js";

// Fetch all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from DB
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
