import { useState } from "react";
import axios from "axios";

const AdminPerformanceDownload = () => {
  const [filter, setFilter] = useState("thisMonth");

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `/api/data/generate-pdf-admin-performance?filter=${filter}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "admin-performance.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="p-2 border rounded mb-4"
      >
        <option className="text-black" value="thisMonth">
          This Month (Up to Today)
        </option>
        <option className="text-black" value="lastMonth">
          Last Month
        </option>
      </select>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Download Performance Report
      </button>
    </div>
  );
};

export default AdminPerformanceDownload;
