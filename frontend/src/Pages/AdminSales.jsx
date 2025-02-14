import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const AdminSalesChart = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const clickedBarsRef = useRef({}); // Store clicked bars for highlighting

  useEffect(() => {
    fetchSalesData();
  }, [month, year]);

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(
        `/api/admin-usermangement/admin-sales-data?month=${month}&year=${year}`
      );
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

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((entry) => entry.day),
        datasets: [
          {
            label: "Daily Sales",
            data: data.map((entry) => entry.totalSales),
            backgroundColor: data.map((_, index) =>
              clickedBarsRef.current[index]
                ? "rgba(255, 99, 132, 0.7)"
                : "rgba(59, 130, 246, 0.7)"
            ),
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            clickedBarsRef.current[index] = !clickedBarsRef.current[index];
            renderChart(data);
          }
        },
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
        Monthly Sales Chart
      </h1>

      <div className="flex flex-wrap justify-center space-x-4 mb-6">
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
            (_, i) => new Date().getFullYear() - i
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

export default AdminSalesChart;
