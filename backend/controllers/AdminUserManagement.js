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
    let { month, year, type } = req.query;

    const now = new Date();
    month = month ? parseInt(month) : now.getMonth() + 1;
    year = year ? parseInt(year) : now.getFullYear();

    let matchStage = {
      $expr: { $eq: [{ $year: "$createdAt" }, year] },
    };

    if (type === "monthly") {
      const startDate = new Date(year, month - 1, 1); // 1st day of the month
      const endDate = new Date(); // Today (ensures it only fetches up to the current date)
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const groupStage =
      type === "yearly"
        ? {
            _id: { $month: "$createdAt" }, // Aggregate per month
            totalProfit: { $sum: "$totalProfit" },
          }
        : {
            _id: { $dayOfMonth: "$createdAt" }, // Aggregate per day
            totalProfit: { $sum: "$totalProfit" },
          };

    const profitData = await DailySales.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    const formattedData = profitData.map((entry) => ({
      label: entry._id.toString(),
      totalProfit: entry.totalProfit,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching profit data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    let { month, year } = req.query;

    const now = new Date();
    month = month ? parseInt(month) : now.getMonth() + 1;
    year = year ? parseInt(year) : now.getFullYear();

    // Start from the 1st of the selected month
    const startDate = new Date(year, month - 1, 1);
    // End date is today if it's the current month, otherwise the last day of the selected month
    const endDate =
      month === now.getMonth() + 1 && year === now.getFullYear()
        ? now
        : new Date(year, month, 0);

    const salesData = await DailySales.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          totalSales: { $sum: "$totalSales" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.json(
      salesData.map((entry) => ({
        day: entry._id.day,
        totalSales: entry.totalSales,
      }))
    );
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCreditReport = async (req, res) => {
  try {
    let { month, year, type } = req.query;

    const now = new Date();
    month = month ? parseInt(month) : now.getMonth() + 1;
    year = year ? parseInt(year) : now.getFullYear();

    let matchStage = {};

    if (type === "monthly") {
      // Filter for the selected month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      matchStage = { createdAt: { $gte: startDate, $lte: endDate } };
    } else if (type === "yearly") {
      // Filter for the selected year
      const startYear = new Date(year, 0, 1);
      const endYear = new Date(year, 11, 31);
      matchStage = { createdAt: { $gte: startYear, $lte: endYear } };
    }

    const creditData = await DailySales.aggregate([
      { $match: matchStage },
      { $unwind: "$customers" },
      {
        $group: {
          _id:
            type === "monthly"
              ? { day: { $dayOfMonth: "$createdAt" } }
              : { month: { $month: "$createdAt" } },
          totalCredit: { $sum: "$customers.credit" },
        },
      },
      { $sort: { "_id.day": 1, "_id.month": 1 } },
    ]);

    res.json(
      creditData.map((entry) => ({
        label:
          type === "monthly"
            ? `Day ${entry._id.day}`
            : `Month ${entry._id.month}`,
        totalCredit: entry.totalCredit,
      }))
    );
  } catch (error) {
    console.error("Error fetching credit report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTotalExpenseData = async (req, res) => {
  try {
    const { month, year, type } = req.query;

    const matchStage = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
          ...(type === "monthly"
            ? [{ $eq: [{ $month: "$createdAt" }, parseInt(month)] }]
            : []),
        ],
      },
    };

    const groupStage =
      type === "yearly"
        ? {
            _id: { $month: "$createdAt" },
            totalExpense: { $sum: "$totalExpense" },
          }
        : {
            _id: { $dayOfMonth: "$createdAt" },
            totalExpense: { $sum: "$totalExpense" },
          };

    const expenses = await DailySales.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    const formattedData = expenses.map((entry) => ({
      label: entry._id.toString(),
      totalExpense: entry.totalExpense,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching expense data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
