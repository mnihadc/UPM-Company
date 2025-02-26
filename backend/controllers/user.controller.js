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

export const getLeaveApplications = async (req, res) => {
  try {
    // Fetch all leave applications sorted by createdAt in descending order
    const leaveApplications = await LeaveApplication.find()
      .sort({ createdAt: -1 }) // Latest applications first
      .populate("userId", "username email"); // Populate user details

    // Group leave applications by status
    const groupedLeaves = {
      pending: leaveApplications.filter((leave) => leave.status === "Pending"),
      approved: leaveApplications.filter(
        (leave) => leave.status === "Approved"
      ),
      rejected: leaveApplications.filter(
        (leave) => leave.status === "Rejected"
      ),
    };

    res.status(200).json(groupedLeaves);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leave applications", error });
  }
};

// Update leave application status
export const updateLeaveApplication = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate the status
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find and update the leave application
    const updatedLeave = await LeaveApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "username email");

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating leave application", error });
  }
};
