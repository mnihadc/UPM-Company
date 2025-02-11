import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sales: { type: Number, required: true },
  profit: { type: Number, required: true },
  credit: { type: Number, required: true },
});

const DailySalesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalExpense: { type: Number, required: true },
    totalSales: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    customers: { type: [CustomerSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("DailySales", DailySalesSchema);
