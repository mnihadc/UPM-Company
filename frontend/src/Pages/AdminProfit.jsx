import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const AdminProfitChart = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [profitData, setProfitData] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchProfitData();
  }, [month, year]);

  useEffect(() => {
    // Listen for screen resize to adjust chart orientation
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (profitData.length > 0) {
        renderChart(profitData);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [profitData]);

  const fetchProfitData = async () => {
    try {
      const response = await axios.get(
        `/api/admin-usermangement/profit-chart?month=${month}&year=${year}`
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

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((entry) => entry.day),
        datasets: [
          {
            label: "Daily Profit",
            data: data.map((entry) => entry.totalProfit),
            backgroundColor: "rgba(34, 197, 94, 0.7)", // Tailwind green-500 with transparency
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: isMobile ? "y" : "x", // Rotate chart on mobile
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
        Monthly Profit Chart
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
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

export default AdminProfitChart;
