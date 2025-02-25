import { useState } from "react";

const LeaveApplicationPage = () => {
  // Dummy username from token (replace with actual token logic)
  const username = "JohnDoe";

  // State for form inputs
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const leaveApplication = {
      username,
      leaveType,
      startDate,
      endDate,
      reason,
    };
    console.log("Leave Application Submitted:", leaveApplication);
    setMessage("Your leave application has been sent to the admin.");
    // Clear form fields
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Leave Application
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              readOnly
              className="w-full bg-gray-700 text-white p-2 rounded-md cursor-not-allowed"
            />
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
              className="w-full bg-gray-700 text-white p-2 rounded-md"
            >
              <option value="" disabled>
                Select Leave Type
              </option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation Leave">Vacation Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full bg-gray-700 text-white p-2 rounded-md"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full bg-gray-700 text-white p-2 rounded-md"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full bg-gray-700 text-white p-2 rounded-md"
              rows="4"
              placeholder="Enter your reason for leave..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Submit Application
          </button>
        </form>

        {/* Success Message */}
        {message && (
          <div className="mt-6 p-4 bg-green-600 text-white rounded-md text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApplicationPage;
