import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const AdminUserCredit = () => {
  const currentDate = new Date();
  const today = currentDate.toISOString().split("T")[0];
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [filter, setFilter] = useState("today");
  const [date, setDate] = useState(today);
  const [creditData, setCreditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    fetchCreditData();
  }, [filter, date, month, year]);

  const fetchCreditData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/admin-usermangement/admin-credit-user",
        { params: { filter, date, month, year } }
      );
      setCreditData(response.data);
      renderChart(response.data);
    } catch (error) {
      console.error("Error fetching credit data:", error);
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

    if (data.length === 0) {
      chartRef.current = null;
      return;
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((entry) => entry.username),
        datasets: [
          {
            label: "Total Credit",
            data: data.map((entry) => entry.totalCredit),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isMobile ? "y" : "x",
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
        plugins: { legend: { display: false } },
      },
    });
  };

  return (
    <div className="p-2 bg-gray-900 text-white min-h-screen pt-20 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">
        User Credit Report
      </h1>

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

      {loading && (
        <div className="flex justify-center items-center mt-10 mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>
      )}

      {creditData.length === 0 && !loading && (
        <p className="text-gray-400 text-lg mb-4">No Data Available</p>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto min-h-[24rem] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-96"></canvas>
      </div>
    </div>
  );
};

export default AdminUserCredit;
