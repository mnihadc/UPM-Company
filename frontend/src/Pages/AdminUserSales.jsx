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
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

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
    try {
      const response = await axios.get(
        "/api/admin-usermangement/admin-sales-user",
        { params: { filter, date, month, year } }
      );
      setSalesData(response.data);
      renderChart(response.data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const renderChart = (data) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (data.length === 0) return; // Prevents rendering an empty chart

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
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
        plugins: { legend: { display: false } },
      },
    });
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen pt-20 flex flex-col items-center">
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

      {/* Chart Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto min-h-[24rem] flex items-center justify-center">
        {salesData.length > 0 ? (
          <canvas ref={canvasRef} className="w-full h-96"></canvas>
        ) : (
          <p className="text-gray-400 text-lg">No Data Available</p>
        )}
      </div>
    </div>
  );
};

export default AdminUserSales;
