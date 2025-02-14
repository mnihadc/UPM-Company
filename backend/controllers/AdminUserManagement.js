import User from "../models/User.model.js";
import DailySales from "../models/DailySales.model.js";
// Fetch all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from DB
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateEmployeeVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_verify } = req.body;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { employee_verify },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Employee verification status updated", user });
  } catch (error) {
    console.error("Error updating employee verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlyProfit = async (req, res) => {
  try {
    let { month, year } = req.query;

    const now = new Date();
    month = month ? parseInt(month) : now.getMonth() + 1;
    year = year ? parseInt(year) : now.getFullYear();

    // Calculate start and end dates
    const startDate = new Date(year, month - 1, 1); // First day of the month
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

    // Aggregate total profit per day within the selected month
    const profitData = await DailySales.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.status(200).json(
      profitData.map((entry) => ({
        day: entry._id.day,
        totalProfit: entry.totalProfit,
      }))
    );
  } catch (error) {
    console.error("Error fetching profit data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
