import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const AdminProfitChart = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [type, setType] = useState("monthly"); // Default to monthly
  const [profitData, setProfitData] = useState([]);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchProfitData();
  }, [month, year, type]);

  const fetchProfitData = async () => {
    try {
      const response = await axios.get(
        `/api/admin-usermangement/profit-chart?month=${month}&year=${year}&type=${type}`
      );
      setProfitData(response.data);
      renderChart(response.data);
    } catch (error) {
      console.error("Error fetching profit data:", error);
    }
  };

  const renderChart = (data) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels:
          type === "yearly"
            ? data.map(
                (entry) =>
                  monthNames[parseInt(entry.label, 10) - 1] || entry.label
              )
            : data.map((entry) => `Day ${entry.label}`), // Show 'Day X' for better readability
        datasets: [
          {
            label: "Total Profit",
            data: data.map((entry) => entry.totalProfit),
            backgroundColor: "rgba(34, 197, 94, 0.7)",
            borderColor: "rgba(34, 197, 94, 1)",
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
        plugins: {
          legend: { display: false },
        },
      },
    });
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen pt-20">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {type === "monthly" ? "Monthly Profit Report" : "Yearly Profit Report"}
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
        <select
          className="p-2 bg-gray-800 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        {type === "monthly" && (
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
        )}

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
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
        <canvas ref={canvasRef} className="w-full h-96"></canvas>
      </div>
    </div>
  );
};

export default AdminProfitChart;
