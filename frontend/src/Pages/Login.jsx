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
  const { loading } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());

    try {
      const response = await axios.post("/api/auth/login", formData);
      localStorage.setItem("authToken", response.data.token);
      dispatch(signInSuccess(response.data));
      Swal.fire({
        title: "Login Successful",
        text: "You have successfully logged in.",
        icon: "success",
        confirmButtonText: "OK",
      });
      navigate("/");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg sm:w-96">
        <h2 className="text-4xl font-semibold text-center text-[#1E3A8A] mb-6">
          Welcome Back!
        </h2>
        <p className="text-xl text-center text-[#374151] mb-8">
          Sign in to continue to your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-[#374151] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-[#374151] mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <a
              href="/forgot-password"
              className="text-[#10B981] text-sm hover:text-[#1E3A8A] transition duration-200"
            >
              Forgot Password?
            </a>
            <a
              href="/signup"
              className="text-[#10B981] text-sm hover:text-[#1E3A8A] transition duration-200"
            >
              Create an Account
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2563EB] text-white font-semibold rounded-md hover:bg-[#1E3A8A] transition duration-300 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
