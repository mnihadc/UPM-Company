import DailySales from "../models/DailySales.model.js";
import User from "../models/User.model.js";

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
