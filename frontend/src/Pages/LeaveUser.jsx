import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const LeaveApplicationPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser?.user.username;
  const email = currentUser?.user.email;

  const navigate = useNavigate(); // Initialize navigate

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const leaveApplication = {
      username,
      email,
      leaveType,
      leaveStartDate: startDate,
      leaveEndDate: endDate,
      reason,
    };

    try {
      const response = await axios.post(
        "/api/user/create-leave",
        leaveApplication,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 201) {
        setMessage("Your leave application has been sent to the admin.");
        setLeaveType("");
        setStartDate("");
        setEndDate("");
        setReason("");

        // Redirect to /profile after 2 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (error) {
      setMessage("Error submitting leave application. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-2 pt-5">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Leave Application
        </h1>
        <div className="text-sm text-gray-400 mb-4 text-center">
          {currentDateTime}
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-400">
            <span className="font-medium">Username:</span> {username}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-medium">Email:</span> {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Submit Application
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-md text-center ${
              message.includes("Error") ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApplicationPage;
