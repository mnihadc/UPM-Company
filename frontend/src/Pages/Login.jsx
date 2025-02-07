import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../Redux/user/userSlice";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.user); // Getting loading state from Redux

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Dynamically updating formData
    });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart()); // Start loading state

    try {
      const response = await axios.post("/api/auth/login", formData);

      // Save token in localStorage
      localStorage.setItem("authToken", response.data.token);

      // Dispatch success with user data
      dispatch(signInSuccess(response.data));

      // Show success message
      Swal.fire({
        title: "Login Successful",
        text: "You have successfully logged in.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Navigate to the dashboard
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed.";
      dispatch(signInFailure(errorMessage));

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg sm:w-96">
        <h2 className="text-4xl font-semibold text-center text-indigo-600 mb-6">
          Welcome Back!
        </h2>
        <p className="text-xl text-center text-gray-700 mb-8">
          Sign in to continue to your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <a
              href="/forgot-password"
              className="text-indigo-600 text-sm hover:text-indigo-800 transition duration-200"
            >
              Forgot Password?
            </a>
            <a
              href="/signup"
              className="text-indigo-600 text-sm hover:text-indigo-800 transition duration-200"
            >
              Create an Account
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
