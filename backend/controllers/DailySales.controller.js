import DailySales from "../models/DailySales.model.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";

export const createDailySales = async (req, res) => {
  try {
    const { userId, customers } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Check if sales data already exists for today
    const existingSales = await DailySales.findOne({
      userId,
      createdAt: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lt: new Date(`${today}T23:59:59.999Z`),
      },
    });

    // Calculate totals
    const totalSales = customers.reduce(
      (sum, c) => sum + Number(c.sales || 0),
      0
    );
    const totalProfit = customers.reduce(
      (sum, c) => sum + Number(c.profit || 0),
      0
    );
    const totalExpense = customers.reduce(
      (sum, c) => sum + Number(c.expense || 0),
      0
    );

    // If sales data exists for today, update it
    if (existingSales) {
      existingSales.customers = customers;
      existingSales.totalSales = totalSales;
      existingSales.totalProfit = totalProfit;
      existingSales.totalExpense = totalExpense;

      await existingSales.save();
      return res.status(200).json({
        message: "Daily sales updated successfully",
        salesData: existingSales,
      });
    }

    // If no sales data exists for today, create a new entry
    const newSalesEntry = new DailySales({
      userId,
      totalSales,
      totalExpense,
      totalProfit,
      customers,
    });

    await newSalesEntry.save();
    res.status(201).json({
      message: "Daily sales recorded successfully",
      salesData: newSalesEntry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get today's sales for a user
export const getTodaySales = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = moment().startOf("day"); // Get today's date (00:00:00)

    const todaySales = await DailySales.findOne({
      userId,
      createdAt: {
        $gte: today.toDate(),
        $lt: moment(today).endOf("day").toDate(),
      },
    });

    if (!todaySales) {
      return res.status(404).json({ message: "No sales found for today" });
    }

    res.json(todaySales);
  } catch (error) {
    console.error("Error fetching today's sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update or create daily sales data
export const updateDailySales = async (req, res) => {
  try {
    const { _id, userId, totalSales, totalExpense, totalProfit, customers } =
      req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let salesEntry;

    if (_id) {
      salesEntry = await DailySales.findById(_id);
      if (!salesEntry) {
        return res.status(404).json({ message: "Sales entry not found" });
      }
    } else {
      salesEntry = await DailySales.findOne({
        userId,
        createdAt: { $gte: today },
      });
    }

    if (salesEntry) {
      salesEntry.totalSales = totalSales;
      salesEntry.totalExpense = totalExpense;
      salesEntry.totalProfit = totalProfit;
      salesEntry.customers = customers;

      await salesEntry.save();
      return res.status(200).json({
        message: "Sales data updated successfully",
        sales: salesEntry,
      });
    } else {
      const newSales = new DailySales({
        userId,
        totalSales,
        totalExpense: totalExpense,
        totalProfit,
        customers,
      });

      await newSales.save();
      return res.status(201).json({
        message: "Sales data created successfully",
        sales: newSales,
      });
    }
  } catch (error) {
    console.error("Error updating daily sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const dailySales = async (req, res) => {
  try {
    // ✅ Read token from cookies (or headers if needed)
    const token = req.cookies.authToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;

    // ✅ Fetch sales for the logged-in user
    const salesData = await DailySales.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(salesData);
  } catch (error) {
    console.error("Daily Sales Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getDailySalesChart = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let { startDate, endDate, month } = req.query;
    let filter = { userId };

    if (startDate && endDate) {
      // If startDate and endDate exist, filter by date range
      filter.createdAt = {
        $gte: moment(startDate, "YYYY-MM-DD").startOf("day").toDate(),
        $lte: moment(endDate, "YYYY-MM-DD").endOf("day").toDate(),
      };
    } else if (month) {
      // If no date range is given, but month is selected
      const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
      const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();
      filter.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    } else {
      // Default: Last 7 days if nothing is selected
      filter.createdAt = {
        $gte: moment().subtract(7, "days").startOf("day").toDate(),
      };
    }

    const salesData = await DailySales.find(filter)
      .sort({ createdAt: 1 })
      .select("createdAt totalSales");

    const formattedData = salesData.map((item) => ({
      date: moment(item.createdAt).format("YYYY-MM-DD"),
      totalSales: item.totalSales,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const creditUser = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const sales = await DailySales.find({ userId }).select(
      "customers createdAt"
    );
    const userCustomers = sales.flatMap((s) =>
      s.customers.map((c) => ({
        ...c.toObject(),
        createdAt: s.createdAt,
        orderId: s._id,
      }))
    );

    const customersWithCredit = userCustomers.filter((c) => c.credit > 0);

    customersWithCredit.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.json(customersWithCredit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateCredit = async (req, res) => {
  try {
    const { id } = req.params; // Customer ID
    const { credit, orderId } = req.body; // Order ID and new credit value

    if (credit === undefined || credit === null || isNaN(credit)) {
      return res
        .status(400)
        .json({ message: "Valid credit value is required" });
    }

    // Step 1: Check if the order exists and if the customer is part of that order
    const dailySales = await DailySales.findOne(
      { _id: orderId, "customers._id": id },
      { "customers.$": 1 } // Fetch only the relevant customer's data
    );

    if (!dailySales || !dailySales.customers.length) {
      return res.status(404).json({ message: "Order or Customer not found" });
    }

    const existingCredit = dailySales.customers[0].credit;

    // Step 2: Ensure the new credit is not greater than the existing credit
    if (Number(credit) > existingCredit) {
      return res.status(400).json({
        message:
          "You cannot increase the credit amount. Only reductions are allowed.",
      });
    }

    // Step 3: Update the specific customer's credit (only if it's lower)
    const result = await DailySales.updateOne(
      { _id: orderId, "customers._id": id },
      { $set: { "customers.$.credit": Number(credit) } }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Customer not found in this order" });
    }

    res.status(200).json({
      message: "Credit updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating credit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    let { month, year } = req.query;

    // Convert month and year to numbers
    month = parseInt(month);
    year = parseInt(year);

    let filter = {};

    // Ensure both month and year are valid before filtering
    if (!isNaN(month) && !isNaN(year)) {
      filter.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }

    const salesData = await DailySales.aggregate([
      { $match: filter },
      { $group: { _id: "$userId", totalSales: { $sum: "$totalSales" } } },
      { $sort: { totalSales: -1 } },
    ]);

    const users = await Promise.all(
      salesData.map(async (sale) => {
        const user = await User.findById(sale._id).select(
          "username profilePic email"
        );
        return user
          ? { ...user.toObject(), totalSales: sale.totalSales }
          : null;
      })
    );

    res.json({
      users: users.filter(Boolean),
      leader: users.length ? users[0] : null,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Server error" });
  }
};
