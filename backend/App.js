import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import adminUserManagement from "./routes/AdminUserManagement.route.js";
import salesManagement from "./routes/DailySales.route.js";
import userRoutes from "./routes/user.route.js";
import dataRoutes from "./routes/data.route.js";
import path from "path";
dotenv.config();
const __dirname = path.resolve();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow credentials (cookies)
  })
);

const port = process.env.PORT;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin-usermangement", adminUserManagement);
app.use("/api/sales", salesManagement);
app.use("/api/user", userRoutes);
app.use("/api/data", dataRoutes);

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
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});
app.listen(port, () => {
  console.log(`Server is Running on port ${port}!!!`);
});
