import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // To capture the token from the URL (JWT token)
import axios from "axios"; // For making API requests

const EmailVerify = () => {
  const { token } = useParams(); // Getting token from the URL
  const [otp, setOtp] = useState(""); // Store OTP input
  const [error, setError] = useState(""); // Store error message
  const [loading, setLoading] = useState(false); // Store loading state
  const [success, setSuccess] = useState(false); // Store success state

  useEffect(() => {
    // If token doesn't exist or invalid, prompt user
    if (!token) {
      setError("Invalid or expired link.");
    }
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);

    try {
      // Send OTP to backend for validation
      const response = await axios.post("/api/auth/verify-email", {
        token,
        otp,
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Error while verifying OTP. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md sm:w-96">
        <header className="flex justify-center items-center bg-blue-600 text-white w-16 h-16 rounded-full mx-auto mb-6">
          <i className="bx bxs-check-shield text-3xl"></i>
        </header>
        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
          Verify Your Email
        </h2>
        <p className="text-lg text-center text-gray-700 mb-6">
          We sent a 6-digit OTP to your email. Please enter it below.
        </p>

        {/* Error or Success Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center">
            Email verified successfully!
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-lg font-semibold text-gray-700"
            >
              Enter OTP
            </label>
            <div className="grid grid-cols-6 gap-3">
              {Array(6)
                .fill("")
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp${index + 1}`}
                    name={`otp${index + 1}`}
                    value={otp[index] || ""}
                    onChange={(e) =>
                      setOtp((prevOtp) => {
                        const updatedOtp = [...prevOtp];
                        updatedOtp[index] = e.target.value;
                        return updatedOtp.join("");
                      })
                    }
                    maxLength="1"
                    required
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Didnt receive the OTP?{" "}
            <button
              className="text-indigo-600 hover:underline"
              onClick={() =>
                setError("OTP resent. Please check your email again.")
              }
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;
