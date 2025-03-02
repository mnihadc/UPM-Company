import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const UserPerformance = () => {
  const [filter, setFilter] = useState("thisMonth");
  const [username, setUsername] = useState("");

  // Fetch the username from the backend when the component mounts
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch username");
        }
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []);

  const downloadPDF = async () => {
    try {
      if (!username) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Username not available!",
        });
        return;
      }

      // Get the current date and calculate the month and year
      const today = new Date();
      const month = today.toLocaleString("default", { month: "long" }); // Full month name (e.g., "October")
      const year = today.getFullYear();

      // Construct the file name based on the filter
      let fileName;
      if (filter === "thisMonth") {
        const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
        fileName = `${username}-${month}-upto-${formattedDate}.pdf`;
      } else if (filter === "lastMonth") {
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastMonthName = lastMonth.toLocaleString("default", {
          month: "long",
        });
        fileName = `${username}-${lastMonthName}-${year}.pdf`;
      }

      // Fetch the PDF from the backend
      const response = await fetch(
        `/api/data/generate-pdf-user-performance?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }
      const blob = await response.blob();

      // Check if the blob is empty (no data)
      if (blob.size === 0) {
        Swal.fire({
          icon: "info",
          title: "No Data",
          text: "There is no data available to download for the selected period.",
        });
        return;
      }

      // Create a link to download the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // Use the dynamically generated file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up the URL object

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Download Successful",
        text: "The PDF has been downloaded successfully!",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while downloading the PDF!",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="thisMonth" className="text-black">
            This Month (Up to Today)
          </option>
          <option value="lastMonth" className="text-black">
            Last Month
          </option>
        </select>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadPDF}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Download PDF
      </button>
    </div>
  );
};

export default UserPerformance;
