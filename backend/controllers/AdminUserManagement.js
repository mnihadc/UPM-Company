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
      // Today’s Sales
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

export const getAdminUserProfit = async (req, res) => {
  try {
    const { filter, date, month, year } = req.query;

    let matchCondition = {};

    if (filter === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      matchCondition.createdAt = { $gte: startOfToday, $lt: endOfToday };
    } else if (filter === "date" && date) {
      const selectedDate = new Date(date);
      matchCondition.createdAt = {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
      };
    } else if (filter === "monthly" && month && year) {
      matchCondition.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }

    const profitData = await DailySales.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$userId",
          totalProfit: { $sum: "$totalProfit" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$user.username",
          totalProfit: 1,
        },
      },
      { $sort: { totalProfit: -1 } },
    ]);

    res.json(profitData);
  } catch (error) {
    console.error("Error fetching profit data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminUserExpenses = async (req, res) => {
  try {
    const { filter, date, month, year } = req.query;
    let matchCondition = {};

    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchCondition = { createdAt: { $gte: today, $lt: tomorrow } };
    } else if (filter === "date") {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      matchCondition = { createdAt: { $gte: selectedDate, $lt: nextDay } };
    } else if (filter === "monthly") {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      matchCondition = { createdAt: { $gte: startOfMonth, $lte: endOfMonth } };
    }

    const expenses = await DailySales.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$userId",
          totalExpense: { $sum: "$totalExpense" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalExpense: 1,
        },
      },
    ]);

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching user expenses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAdminUserCredits = async (req, res) => {
  try {
    const { filter, date, month, year } = req.query;
    let matchCondition = {};

    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchCondition = { createdAt: { $gte: today, $lt: tomorrow } };
    } else if (filter === "date") {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      matchCondition = { createdAt: { $gte: selectedDate, $lt: nextDay } };
    } else if (filter === "monthly") {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      matchCondition = { createdAt: { $gte: startOfMonth, $lte: endOfMonth } };
    }

    const credits = await DailySales.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$userId",
          totalCredit: { $sum: { $sum: "$customers.credit" } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalCredit: 1,
        },
      },
    ]);

    res.json(credits);
  } catch (error) {
    console.error("Error fetching user credits:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetAdminDailySales = async (req, res) => {
  try {
    let { date } = req.query;

    // Default to today's date
    const today = new Date();
    if (!date) {
      date = today.toISOString().split("T")[0];
    }

    // Start and end range for the selected date
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const salesData = await DailySales.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("userId", "username email");

    res.status(200).json(salesData);
  } catch (error) {
    console.error("Error fetching admin daily sales:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
