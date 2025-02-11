import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import adminUserManagement from "./routes/AdminUserManagement.route.js";
import salesManagement from "./routes/DailySales.route.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin-usermangement", adminUserManagement);
app.use("/api/sales", salesManagement);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.listen(port, () => {
  console.log(`Server is Running on port ${port}!!!`);
});
