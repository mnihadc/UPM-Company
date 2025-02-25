import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  file: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  sales: { type: Number, required: true, min: 0 },
  profit: { type: Number, required: true, min: 0 },
  credit: { type: Number, required: true, min: 0 },
  expense: { type: Number, required: true, min: 0 },
  vat: { type: Number, required: true, min: 0 },
  parts: { type: Number, required: true, min: 0 },
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
