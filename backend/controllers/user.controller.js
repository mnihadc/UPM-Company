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
