import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", { email, password });

      // Save the JWT token in localStorage or cookies
      localStorage.setItem("authToken", response.data.token);

      Swal.fire({
        title: "Login Successful",
        text: response.data.message,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Navigate to the dashboard or home page
      navigate("/dashboard"); // or wherever you want to redirect after login
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message || "Login failed. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
