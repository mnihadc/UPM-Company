import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [emailFilter, setEmailFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("");

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

  const handleDelete = async (id, username) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you really want to delete ${username}? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/api/admin-usermangement/delete-user/${id}`);
      setUsers(users.filter((user) => user._id !== id));

      Swal.fire({
        title: "Deleted!",
        text: `${username} has been removed successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "There was an issue deleting the user.",
        icon: "error",
      });
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
  const filteredUsers = users.filter((user) => {
    const matchesSearch = [
      user.username,
      user.email,
      user.mobile.toString(),
    ].some((field) => field.toLowerCase().includes(search.toLowerCase()));

    const matchesEmailFilter =
      emailFilter === "all" ||
      (emailFilter === "emailVerifiedAdminPending" &&
        user.email_verify &&
        !user.employee_verify) ||
      (emailFilter === "emailNotVerified" && !user.email_verify);

    const matchesRoleFilter = roleFilter === "" || user.role === roleFilter;

    return matchesSearch && matchesEmailFilter && matchesRoleFilter;
  });

  const handleAdminToggle = async (id, username, currentStatus) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${
        currentStatus ? "remove" : "make"
      } ${username} an admin?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${currentStatus ? "remove" : "make"} admin!`,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`/api/auth/update-admin-status/${id}`, {
        isAdmin: !currentStatus,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isAdmin: !currentStatus } : user
        )
      );

      Swal.fire({
        title: "Success!",
        text: `${username} has been ${
          currentStatus ? "removed from" : "granted"
        } admin privileges.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "There was an issue updating the admin status.",
        icon: "error",
      });
      console.error("Error updating admin status", error);
    }
  };

  return (
    <div className="p-2 pt-20 bg-gray-900 text-white min-h-screen w-full overflow-x-auto">
      <h1 className="p-2 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide">
        User Management
      </h1>
      <div className="w-48 h-1 bg-blue-500 mx-auto mb-6 rounded"></div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border border-gray-600 bg-gray-900 text-white rounded"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="emailVerifiedAdminPending">
            Email Verified (Admin Pending)
          </option>
          <option value="emailNotVerified">Email Not Verified</option>
        </select>

        <select
          className="p-2 border border-gray-600 bg-gray-900 text-white rounded"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="Manager Senior">Manager Senior</option>
          <option value="Manager Junior">Manager Junior</option>
          <option value="Sales Executive Senior">Sales Executive Senior</option>
          <option value="Sales Executive Junior">Sales Executive Junior</option>
          <option value="Technician">Technician</option>
          <option value="Office Staff">Office Staff</option>
        </select>
      </div>
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
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800">
                <td className="p-3 border-b">{user.username}</td>
                <td className="p-3 border-b">{user.age}</td>
                <td className="p-3 border-b">{user.mobile}</td>
                <td className="p-3 border-b">{user.gender}</td>
                <td className="p-3 border-b">{user.role}</td>
                <td className="p-3 border-b">{user.email}</td>
                <td
                  className="p-3 border-b cursor-pointer flex items-center gap-2 pb-7"
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
                    onChange={() =>
                      handleAdminToggle(user._id, user.username, user.isAdmin)
                    }
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-3 border-b">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="p-3 border-b">
                  {new Date(user.updatedAt).toLocaleString()}
                </td>
                <td className="p-3 border-b">
                  <button
                    className="p-2 bg-red-600 rounded hover:bg-red-500"
                    onClick={() => handleDelete(user._id, user.username)}
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
