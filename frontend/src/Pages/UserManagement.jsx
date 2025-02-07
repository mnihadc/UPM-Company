import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin-usermangement/get-users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin-usermangement/delete-user/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  const handleEmployeeVerifyToggle = async (id, username, currentStatus) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${
        currentStatus ? "remove" : "verify"
      } employee status for ${username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${currentStatus ? "remove" : "verify"} it!`,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`/api/admin-usermangement/update-employee-verify/${id}`, {
        employee_verify: !currentStatus,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, employee_verify: !currentStatus } : user
        )
      );

      Swal.fire({
        title: "Success!",
        text: `Employee verification status for ${username} has been updated.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "There was an issue updating the status.",
        icon: "error",
      });
      console.error("Error updating employee verification", error);
    }
  };

  return (
    <div className="p-6 pt-20 bg-black text-white min-h-screen w-full overflow-x-auto">
      <input
        type="text"
        placeholder="Search users..."
        className="mb-4 w-full p-2 border border-gray-600 bg-gray-900 text-white rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-left min-w-max">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 border-b">Username</th>
              <th className="p-3 border-b">Age</th>
              <th className="p-3 border-b">Mobile</th>
              <th className="p-3 border-b">Gender</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Employee Verified</th>
              <th className="p-3 border-b">Email Verified</th>
              <th className="p-3 border-b">OTP</th>
              <th className="p-3 border-b">Admin</th>
              <th className="p-3 border-b">CreatedAt</th>
              <th className="p-3 border-b">UpdatedAt</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) =>
                [user.username, user.email, user.mobile.toString()].some(
                  (field) => field.toLowerCase().includes(search.toLowerCase())
                )
              )
              .map((user) => (
                <tr key={user._id} className="hover:bg-gray-800">
                  <td className="p-3 border-b">{user.username}</td>
                  <td className="p-3 border-b">{user.age}</td>
                  <td className="p-3 border-b">{user.mobile}</td>
                  <td className="p-3 border-b">{user.gender}</td>
                  <td className="p-3 border-b">{user.role}</td>
                  <td className="p-3 border-b">{user.email}</td>
                  <td
                    className="p-3 border-b cursor-pointer flex items-center gap-2"
                    onClick={() =>
                      handleEmployeeVerifyToggle(
                        user._id,
                        user.username,
                        user.employee_verify
                      )
                    }
                  >
                    {user.employee_verify ? (
                      <>
                        <FaCheckCircle className="text-green-500 text-lg" />
                        <span className="text-green-500">Verified</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-red-500 text-lg" />
                        <span className="text-red-500">Not Verified</span>
                      </>
                    )}
                  </td>
                  <td className="p-3 border-b">
                    {user.email_verify ? "✅ Verified" : "❌ Not Verified"}
                  </td>
                  <td className="p-3 border-b">{user.otp || "N/A"}</td>
                  <td className="p-3 border-b">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="p-3 border-b">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border-b">
                    {new Date(user.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-3 border-b flex gap-2">
                    <button
                      className="p-2 bg-red-600 rounded hover:bg-red-500"
                      onClick={() => handleDelete(user._id)}
                    >
                      <FaTrash className="text-white" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
