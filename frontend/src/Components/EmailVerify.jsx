import { useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);

  // Handle OTP input change and auto-focus
  const handleOtpChange = (index, value) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Handle OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.some((digit) => !digit)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/verify-email", {
        email, // Include email
        otp: otp.join(""),
      });

      Swal.fire({
        title: "Success!",
        text: "Email verified successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP. Try again.");
      Swal.fire({
        title: "Error!",
        text: "Invalid OTP. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (!email) {
      Swal.fire({
        title: "Error!",
        text: "Please enter your email to resend OTP.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setResendLoading(true);
    try {
      const response = await axios.post("/api/auth/resend-otp", { email });

      Swal.fire({
        title: "OTP Sent!",
        text: response.data.message,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to resend OTP.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Verify Your Email
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-gray-300 mb-2">Enter Email</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-700 text-white rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* OTP Input Fields */}
          <div>
            <label className="block text-gray-300 mb-2">Enter OTP</label>
            <div className="grid grid-cols-6 gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  className="w-full p-3 text-center text-lg bg-gray-700 text-green-300 border border-gray-600 rounded-md"
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-400 text-center">{error}</p>}

          {/* Verify OTP Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend OTP Button */}
        <button
          onClick={handleResendOtp}
          disabled={resendLoading}
          className="w-full py-2 mt-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition duration-300"
        >
          {resendLoading ? "Resending OTP..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
