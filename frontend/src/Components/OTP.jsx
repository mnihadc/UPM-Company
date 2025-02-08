import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const OTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || ""; // Get email from state

  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle OTP Input Changes
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP and Password Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match!",
        text: "Please enter the same password in both fields.",
        confirmButtonColor: "#EF4444",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/verifyOtp", {
        email,
        otp: otp.join(""),
        newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data.message,
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        navigate("/login"); // Redirect to login after success
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      await axios.post("/api/auth/resend-otp", { email });
      Swal.fire({
        icon: "info",
        title: "OTP Resent",
        text: "Check your email for the new OTP.",
        confirmButtonColor: "#4F46E5",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to resend OTP.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-indigo-600 text-center mb-4">
          OTP Verification
        </h2>
        <p className="text-gray-700 text-center mb-6">
          Enter the OTP sent to <span className="font-bold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                maxLength="1"
                className="w-12 h-12 text-xl text-center border-2 border-gray-300 rounded-md focus:border-indigo-500 focus:outline-none transition"
              />
            ))}
          </div>

          {/* New Password */}
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Verify & Reset Password"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600">Didn’t receive OTP?</p>
          <button
            onClick={handleResendOtp}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTP;
