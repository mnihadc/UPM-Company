import { useState, useEffect } from "react";

const Leave = () => {
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaveData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/user/get-leave", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leave data");

      const data = await response.json();
      setLeaveData(data);
    } catch (error) {
      console.error("Error fetching leave data:", error);
      setLeaveData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  return (
    <div className="md:col-span-2 bg-gray-800 p-3 rounded-lg pb-10 shadow-lg text-white">
      {/* Top Bar with Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold border-b border-gray-700 pb-3">
          Last Leave Application
        </h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-1  py-1 rounded-lg font-medium transition">
          <a href="/leave-application-user">Create Leave Application</a>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : leaveData ? (
        <div className="space-y-6">
          {/* Created At + Leave Start Date + Leave End Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Created At</label>
              <input
                type="text"
                className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                value={new Date(leaveData.createdAt).toLocaleDateString()}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Leave Start Date
              </label>
              <input
                type="text"
                className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                value={new Date(leaveData.leaveStartDate).toLocaleDateString()}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Leave End Date
              </label>
              <input
                type="text"
                className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                value={new Date(leaveData.leaveEndDate).toLocaleDateString()}
                disabled
              />
            </div>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium">Leave Type</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
              value={leaveData.leaveType}
              disabled
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium">Reason</label>
            <textarea
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
              value={leaveData.reason}
              rows="3"
              disabled
            ></textarea>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <div
              className={`w-full p-3 rounded-lg text-center font-semibold ${
                leaveData.status === "Approved"
                  ? "bg-green-600"
                  : leaveData.status === "Rejected"
                  ? "bg-red-600"
                  : "bg-yellow-600"
              }`}
            >
              {leaveData.status}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center">
          No leave applications found.
        </p>
      )}
    </div>
  );
};

export default Leave;
