import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiEdit, FiLogOut } from "react-icons/fi";
import { FaSave, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import {
  signoutUserStart,
  signoutUserSuccess,
  signoutUserFailure,
} from "../Redux/user/userSlice";
import Leave from "../Components/Leave";
import UserPerformance from "../Components/UserPerformance";
import AdminPerformanceDownload from "../Components/AdminPerformance";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/profile", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setOriginalData(data); // Save original data for reset
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setUserData(originalData); // Reset data
    setEditMode(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const confirmUpdate = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save the changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update!",
    });

    if (confirmUpdate.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const updatedData = await response.json();
          setUserData(updatedData);
          setOriginalData(updatedData); // Update original data after saving
          await Swal.fire(
            "Success",
            "Profile updated successfully!",
            "success"
          );
          setEditMode(false);
        } else {
          Swal.fire("Error", "Failed to update profile", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Something went wrong", "error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    const confirmLogout = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    });

    if (confirmLogout.isConfirmed) {
      try {
        dispatch(signoutUserStart());

        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          dispatch(signoutUserSuccess());
          localStorage.removeItem("token");
          await Swal.fire(
            "Logged Out!",
            "You have been logged out.",
            "success"
          );
          window.location.href = "/login";
        } else {
          dispatch(signoutUserFailure("Logout failed! Please try again."));
          Swal.fire("Error", "Logout failed! Please try again.", "error");
        }
      } catch (error) {
        dispatch(signoutUserFailure(error.message));
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/upload-profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setUserData({ ...userData, avatar: data.user.avatar });
        Swal.fire("Success", "Profile image updated!", "success");
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Upload failed", "error", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 flex justify-center items-center pt-14">
      {loading ? (
        <ClipLoader color="#4A90E2" size={50} />
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center shadow-lg">
            {/* Profile Image */}
            <label htmlFor="fileInput" className="cursor-pointer">
              <img
                src={
                  userData?.avatar ||
                  "https://bootdey.com/img/Content/avatar/avatar7.png"
                }
                alt="User"
                className="rounded-full w-32 h-32 mb-4 border-4 border-gray-600 hover:opacity-80 transition"
              />
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* User Info */}
            <h4 className="text-2xl font-semibold">{userData?.username}</h4>
            <p className="text-gray-400">{userData?.email}</p>
            {currentUser?.user.isAdmin && (
              <a href="/delete-daily-sales-data" className="pt-5">
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                  🚨 Danger
                </button>
              </a>
            )}
            {currentUser?.user.isAdmin && <AdminPerformanceDownload />}
            {!currentUser?.user.isAdmin && <UserPerformance />}
          </div>

          {/* Edit Profile Form */}
          <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">
              Profile Information
            </h3>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    name="username"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    value={userData?.username || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    value={userData?.email || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    value={userData?.mobile || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Gender</label>
                  <select
                    name="gender"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    value={userData?.gender || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Age</label>
                  <input
                    type="text"
                    name="age"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    value={userData?.age || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Created At
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    value={new Date(userData.createdAt).toLocaleDateString()}
                    disabled
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between gap-2">
                {!editMode ? (
                  <button
                    type="button"
                    className="bg-blue-600 px-6 py-2 rounded-lg shadow-md flex items-center gap-2 hover:bg-blue-500"
                    onClick={() => setEditMode(true)}
                  >
                    <FiEdit /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="bg-green-600 px-6 py-2 rounded-lg shadow-md flex items-center gap-2 hover:bg-green-500"
                    >
                      <FaSave /> Save Changes
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 px-6 py-2 rounded-lg shadow-md flex items-center gap-2 hover:bg-red-400"
                      onClick={handleCancel}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="bg-amber-500 px-4 py-2 rounded flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </form>
          </div>
          {!currentUser?.user.isAdmin && <Leave />}
          <div className=""></div>
        </div>
      )}
    </div>
  );
};

export default Profile;
