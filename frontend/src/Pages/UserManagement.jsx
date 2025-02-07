import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaBan } from "react-icons/fa";

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

  const handleBlock = async (id) => {
    try {
      await axios.put(`/api/admin-usermangement/block-user/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error blocking user", error);
    }
  };

  const handleAdminToggle = async (id, isAdmin) => {
    try {
      await axios.put(`/api/admin-usermangement/update-admin/${id}`, {
        isAdmin: !isAdmin,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating admin status", error);
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
                  <td className="p-3 border-b">
                    {user.employee_verify ? "✅ Verified" : "❌ Not Verified"}
                  </td>
                  <td className="p-3 border-b">
                    {user.email_verify ? "✅ Verified" : "❌ Not Verified"}
                  </td>
                  <td className="p-3 border-b">{user.otp || "N/A"}</td>
                  <td className="p-3 border-b">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={() => handleAdminToggle(user._id, user.isAdmin)}
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
                    <button
                      className="p-2 bg-yellow-600 rounded hover:bg-yellow-500"
                      onClick={() => handleBlock(user._id)}
                    >
                      <FaBan className="text-white" />
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
