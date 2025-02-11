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
