import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();

const port = process.env.PORT;
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
