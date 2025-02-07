import express from "express";
import {
  getUsers,
  updateEmployeeVerify,
} from "../controllers/AdminUserManagement.js";

const router = express.Router();

router.get("/get-users", getUsers);
router.put("/update-employee-verify/:id", updateEmployeeVerify);

export default router;
