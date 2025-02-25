import LeaveApplication from "../models/LeaveUser.model.js";

export const createLeaveApplication = async (req, res) => {
  try {
    const { leaveStartDate, leaveEndDate, leaveType, reason } = req.body;
    const userId = req.user.id;
    const leaveApplication = new LeaveApplication({
      userId,
      leaveStartDate,
      leaveEndDate,
      leaveType,
      reason,
    });

    await leaveApplication.save();
    res.status(201).json({
      message: "Leave application submitted successfully!",
      leaveApplication,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting leave application", error });
  }
};

export const getLeave = async (req, res) => {
  try {
    const userId = req.user.id;

    const latestLeave = await LeaveApplication.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave applications found" });
    }

    res.json(latestLeave);
  } catch (error) {
    console.error("Error fetching leave data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
