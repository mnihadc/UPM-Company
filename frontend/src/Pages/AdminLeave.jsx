import { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";

const AdminLeavePage = () => {
  const [leaveApplications, setLeaveApplications] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Fetch leave applications
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        const response = await axios.get("/api/user/leave-applications-admin", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLeaveApplications(response.data);
      } catch (error) {
        setError("Failed to fetch leave applications. Please try again.");
        console.error("Error fetching leave applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveApplications();
  }, []);

  // Update current date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const showFullReason = (username, reason) => {
    Swal.fire({
      title: `Reason by ${username}`,
      html: `<p>${reason}</p>`,
      confirmButtonText: "Close",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">
        {error}
      </div>
    );
  }

  const updateLeaveStatus = async (id, status) => {
    // Confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to change the status to ${status}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    // If user confirms, proceed with the update
    if (result.isConfirmed) {
      try {
        const response = await axios.put(
          `/api/user/leave-applications/${id}/status`,
          { status },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update the leave applications state
        setLeaveApplications((prev) => {
          const updatedLeave = response.data;
          const updatedPending = prev.pending.filter(
            (leave) => leave._id !== id
          );
          const updatedApproved = prev.approved.filter(
            (leave) => leave._id !== id
          );
          const updatedRejected = prev.rejected.filter(
            (leave) => leave._id !== id
          );

          if (status === "Pending") {
            updatedPending.push(updatedLeave);
          } else if (status === "Approved") {
            updatedApproved.push(updatedLeave);
          } else if (status === "Rejected") {
            updatedRejected.push(updatedLeave);
          }

          return {
            pending: updatedPending,
            approved: updatedApproved,
            rejected: updatedRejected,
          };
        });

        // Show success message
        Swal.fire({
          title: "Updated!",
          text: `The status has been changed to ${status}.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error updating leave status:", error);
        setError("Failed to update leave status. Please try again.");

        // Show error message
        Swal.fire({
          title: "Error!",
          text: "Failed to update leave status. Please try again.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const deleteLeaveApplication = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/user/leave-applications/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setLeaveApplications((prev) => ({
          pending: prev.pending.filter((leave) => leave._id !== id),
          approved: prev.approved.filter((leave) => leave._id !== id),
          rejected: prev.rejected.filter((leave) => leave._id !== id),
        }));

        Swal.fire(
          "Deleted!",
          "The leave application has been deleted.",
          "success"
        );
      } catch (error) {
        console.error("Error deleting leave application:", error);
        Swal.fire("Error!", "Failed to delete leave application.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 pt-20">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Leave Applications
      </h1>
      <div className="w-48 h-1 bg-blue-500 mx-auto mb-6 rounded"></div>
      <div className="text-center text-sm text-gray-400 mb-8">
        Current Date and Time: {currentDateTime}
      </div>

      {/* Pending Leave Applications */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pending</h2>
        {leaveApplications.pending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Username
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Email</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Start Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    End Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Reason</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Created At
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Status</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Actions
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Delete</th>
                </tr>
              </thead>
              <tbody>
                {leaveApplications.pending.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.userId.username}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.userId.email}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.leaveStartDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.leaveEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <div
                        className="truncate cursor-pointer"
                        onClick={() =>
                          showFullReason(leave.userId.username, leave.reason)
                        }
                      >
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <span className="bg-yellow-600 px-2 py-1 rounded-full text-sm">
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <button
                        onClick={() => updateLeaveStatus(leave._id, "Approved")}
                        className="bg-green-600 px-2 py-1 rounded-full text-sm mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(leave._id, "Rejected")}
                        className="bg-red-600 px-2 py-1 rounded-full text-sm"
                      >
                        Reject
                      </button>
                    </td>
                    <button
                      onClick={() => deleteLeaveApplication(leave._id)}
                      className="p-2 bg-red-600 rounded hover:bg-red-500"
                    >
                      <FaTrash className="text-white" />
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No pending leave applications.
          </div>
        )}
      </div>

      {/* Approved Leave Applications */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Approved</h2>
        {leaveApplications.approved.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Username
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Email</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Start Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    End Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Reason</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Created At
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Status</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Actions
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Delete</th>
                </tr>
              </thead>
              <tbody>
                {leaveApplications.approved.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.userId.username}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.userId.email}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.leaveStartDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.leaveEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <div
                        className="truncate cursor-pointer"
                        onClick={() =>
                          showFullReason(leave.userId.username, leave.reason)
                        }
                      >
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <span className="bg-green-600 px-2 py-1 rounded-full text-sm">
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <button
                        onClick={() => updateLeaveStatus(leave._id, "Pending")}
                        className="bg-yellow-600 px-2 py-1 rounded-full text-sm mr-2"
                      >
                        Set Pending
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(leave._id, "Rejected")}
                        className="bg-red-600 px-2 py-1 rounded-full text-sm"
                      >
                        Reject
                      </button>
                    </td>
                    <button
                      onClick={() => deleteLeaveApplication(leave._id)}
                      className="p-2 bg-red-600 rounded hover:bg-red-500"
                    >
                      <FaTrash className="text-white" />
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No approved leave applications.
          </div>
        )}
      </div>

      {/* Rejected Leave Applications */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Rejected</h2>
        {leaveApplications.rejected.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Username
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Email</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Start Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    End Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Reason</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Created At
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Status</th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Actions
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">Delete</th>
                </tr>
              </thead>
              <tbody>
                {leaveApplications.rejected.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.userId.username}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.userId.email}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.leaveStartDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.leaveEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <div
                        className="truncate cursor-pointer"
                        onClick={() =>
                          showFullReason(leave.userId.username, leave.reason)
                        }
                      >
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      {new Date(leave.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <span className="bg-red-600 px-2 py-1 rounded-full text-sm">
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <button
                        onClick={() => updateLeaveStatus(leave._id, "Pending")}
                        className="bg-yellow-600 px-2 py-1 rounded-full text-sm mr-2"
                      >
                        Set Pending
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(leave._id, "Approved")}
                        className="bg-green-600 px-2 py-1 rounded-full text-sm "
                      >
                        Approve
                      </button>
                    </td>
                    <button
                      onClick={() => deleteLeaveApplication(leave._id)}
                      className="p-2 bg-red-600 rounded hover:bg-red-500"
                    >
                      <FaTrash className="text-white" />
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No rejected leave applications.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeavePage;
