import { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    gender: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const roles = [
    "Manager Senior",
    "Manager Junior",
    "Sales Executive Senior",
    "Sales Executive Junior",
    "Technician",
    "Office Staff",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    setLoading(true); // Start loading

    // Prepare data to send to the backend
    const dataToSend = {
      username: formData.username,
      age: formData.age,
      role: formData.role,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      gender: formData.gender,
      avatar: formData.avatar ? formData.avatar.name : null, // Send only file name or null
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Success", "User created successfully!", "success");
        navigate("/email-verify");
        // Optionally, redirect the user to the login page or home
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Swal.fire("Error", "An error occurred. Please try again.", "error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-3xl font-semibold text-center mb-4">
              Create an Account
            </h2>
            <div className="flex justify-center items-center flex-col text-center mb-6">
              <img
                src={
                  formData.avatar
                    ? URL.createObjectURL(formData.avatar)
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCO2sR3EtGqpIpIa-GTVnvdrDHu0WxuzpA8g&s"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                Change Image
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-lg">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-lg">Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-lg">Gender</label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      onChange={handleChange}
                      required
                      className="mr-2"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      onChange={handleChange}
                      required
                      className="mr-2"
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-lg">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter your phone number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-lg">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-lg">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a Role</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-lg">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-lg">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-6 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading} // Disable the button while loading
            >
              {loading ? (
                <div className="spinner-border animate-spin text-white">
                  Loading...
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
