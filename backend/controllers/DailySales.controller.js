import DailySales from "../models/DailySales.model.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const createDailySales = async (req, res) => {
  try {
    const { userId, totalSales, totalExpense, totalProfit, customers } =
      req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get today's date (YYYY-MM-DD) for comparison
    const today = new Date().toISOString().split("T")[0];

    // Check if user has already submitted sales today
    const existingSales = await DailySales.findOne({
      userId,
      createdAt: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lt: new Date(`${today}T23:59:59.999Z`),
      },
    });

    if (existingSales) {
      return res.status(400).json({
        message:
          "You have already submitted today's sales report. Please submit again tomorrow.",
      });
    }

    // Create new DailySales entry
    const newSalesEntry = new DailySales({
      userId,
      totalSales,
      totalExpense,
      totalProfit,
      customers,
    });

    // Save to database
    await newSalesEntry.save();
    res
      .status(201)
      .json({ message: "Daily sales recorded successfully", newSalesEntry });
  } catch (error) {
    console.error("Error creating daily sales:", error);
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
        totalExpense,
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
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get the date 7 days ago
    const sevenDaysAgo = moment().subtract(7, "days").startOf("day").toDate();

    const salesData = await DailySales.find({
      userId: userId,
      createdAt: { $gte: sevenDaysAgo }, // ✅ Last 7 days only
    })
      .sort({ createdAt: 1 }) // ✅ Sort by date ascending
      .select("createdAt totalSales"); // ✅ Only fetch date & totalSales

    // Format data for frontend
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
      s.customers.map((c) => ({ ...c.toObject(), createdAt: s.createdAt }))
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
