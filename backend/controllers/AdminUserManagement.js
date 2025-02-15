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
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const getMonthlySales = async (req, res) => {
  try {
    let { month, year, type } = req.query;
    const now = new Date();
    month = month ? parseInt(month) : now.getMonth() + 1;
    year = year ? parseInt(year) : now.getFullYear();

    let matchStage = { $expr: { $eq: [{ $year: "$createdAt" }, year] } };
    if (type === "monthly") {
      matchStage.createdAt = { $gte: new Date(year, month - 1, 1), $lte: now };
    }

    const groupStage =
      type === "yearly"
        ? { _id: { $month: "$createdAt" }, totalSales: { $sum: "$totalSales" } }
        : {
            _id: { $dayOfMonth: "$createdAt" },
            totalSales: { $sum: "$totalSales" },
          };

    const salesData = await DailySales.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    const formattedData = salesData.map((entry) => ({
      [type === "yearly" ? "month" : "day"]:
        type === "yearly" ? monthNames[entry._id - 1] : entry._id,
      totalSales: entry.totalSales,
    }));

    res.status(200).json(formattedData);
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

export const adminSalesUserChart = async (req, res) => {
  try {
    let { filter, date, month, year } = req.query;
    const now = new Date();

    let matchStage = {};

    if (filter === "today" || !filter) {
      // Default: Today’s Sales
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      matchStage = { createdAt: { $gte: todayStart, $lte: todayEnd } };
    } else if (filter === "monthly") {
      // Monthly Sales
      month = month ? parseInt(month) : now.getMonth() + 1;
      year = year ? parseInt(year) : now.getFullYear();
      matchStage = {
        $expr: {
          $and: [
            { $eq: [{ $year: "$createdAt" }, year] },
            { $eq: [{ $month: "$createdAt" }, month] },
          ],
        },
      };
    } else if (filter === "date" && date) {
      // Specific Date Sales
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchStage = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
    }

    // Aggregate sales per user
    const salesData = await DailySales.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          totalSales: { $sum: "$totalSales" },
        },
      },
      { $sort: { totalSales: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          username: { $arrayElemAt: ["$user.username", 0] },
          totalSales: 1,
        },
      },
    ]);

    res.status(200).json(salesData);
  } catch (error) {
    console.error("Error fetching user sales data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
