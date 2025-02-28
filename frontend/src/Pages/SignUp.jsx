import { useState } from "react";
import Swal from "sweetalert2";
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
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    setLoading(true);

    const dataToSend = {
      username: formData.username,
      age: formData.age,
      role: formData.role,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      gender: formData.gender,
      avatar: formData.avatar ? formData.avatar.name : null,
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
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Swal.fire("Error", "An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex justify-center items-center p-4 pt-10">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-500 hover:scale-105">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center mb-4">
            Create an Account
          </h2>
          <p className="text-lg text-gray-400 text-center mb-6">
            Join us and start your journey today!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Gender
              </label>
              <div className="flex gap-6">
                <label className="flex items-center text-gray-300">
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
                <label className="flex items-center text-gray-300">
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
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter your phone number"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-lg text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-4 border rounded-lg border-gray-700 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
