import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const AdminUserSales = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [filter, setFilter] = useState("today");
  const [date, setDate] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768; // Check if the device is mobile

  useEffect(() => {
    if (filter === "today") {
      setDate(new Date().toISOString().split("T")[0]); // Set today's date
    } else if (filter === "monthly") {
      setMonth(currentDate.getMonth() + 1); // Set default month
      setYear(currentDate.getFullYear()); // Set default year
    }
  }, [filter]);

  useEffect(() => {
    fetchSalesData();
  }, [filter, date, month, year]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/admin-usermangement/admin-sales-user",
        { params: { filter, date, month, year } }
      );
      setSalesData(response.data);
      renderChart(response.data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (data) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((entry) => entry.username),
        datasets: [
          {
            label: "Total Sales",
            data: data.map((entry) => entry.totalSales),
            backgroundColor: "rgba(34, 197, 94, 0.7)",
            borderColor: "rgba(0, 191, 255, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isMobile ? "y" : "x", // Rotate chart for mobile
        scales: {
          x: {
            grid: { display: false },
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
            grid: { display: !isMobile }, // Hide grid for y-axis on mobile
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const value = context.raw || 0;
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    });
  };

  return (
    <div className="p-2 bg-gray-900 text-white min-h-screen pt-20 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">User Sales Report</h1>

      {/* Filter Section */}
      <div className="flex flex-wrap justify-center space-x-4 mb-6">
        <select
          className="p-2 bg-gray-800 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="monthly">Monthly</option>
          <option value="date">Specific Date</option>
        </select>

        {filter === "date" && (
          <input
            type="date"
            className="p-2 bg-gray-800 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {filter === "monthly" && (
          <>
            <select
              className="p-2 bg-gray-800 rounded"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2022, m - 1, 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <select
              className="p-2 bg-gray-800 rounded"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {Array.from(
                { length: 5 },
                (_, i) => currentDate.getFullYear() - i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Loading Spinner Outside Chart */}
      {loading && (
        <div className="flex justify-center items-center mt-10 mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
        </div>
      )}

      <>
        {salesData.length === 0 && (
          <p className="text-gray-400 text-lg mb-4">No Data Available</p>
        )}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto min-h-[24rem] flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-96"></canvas>
        </div>
      </>
    </div>
  );
};

export default AdminUserSales;
