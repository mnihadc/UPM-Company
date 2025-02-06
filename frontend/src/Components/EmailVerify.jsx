import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const EmailVerify = () => {
  const [otp, setOtp] = useState(new Array(6).fill("")); // OTP input values
  const [error, setError] = useState(""); // Error messages
  const [loading, setLoading] = useState(false); // Loading state for verification
  const [success, setSuccess] = useState(false); // Success state for verification
  const [email, setEmail] = useState(""); // State to store email fetched from JWT

  // Fetch the email from the GET route when the component loads
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1];

        if (!token) {
          console.error("No auth token found.");
          return;
        }

        const response = await axios.get("/api/auth/email-verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching email:", error.response?.data || error);
      }
    };

    fetchEmail();
  }, []);

  // Submit handler for OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      const response = await axios.post("/api/auth/verify-email", {
        otp: otp.join(""),
        token,
      });

      if (response.data.message === "Email verified successfully") {
        setSuccess(true);
        setError(""); // Clear any previous errors
        Swal.fire({
          title: "Success!",
          text: "Email verified successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        setError("Invalid OTP. Please try again.");
        Swal.fire({
          title: "Error!",
          text: "Invalid OTP. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      setError("Error while verifying OTP. Please try again.", error);
      Swal.fire({
        title: "Error!",
        text: "There was an error while verifying the OTP.",
        icon: "error",
        confirmButtonText: "OK",
      });
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
          We sent a 6-digit OTP to{" "}
          <strong>{email ? email : "your email address"}</strong>. Please enter
          it below.
        </p>

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
                    onChange={(e) => {
                      const updatedOtp = [...otp];
                      updatedOtp[index] = e.target.value;
                      setOtp(updatedOtp);
                    }}
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
      </div>
    </div>
  );
};

export default EmailVerify;
