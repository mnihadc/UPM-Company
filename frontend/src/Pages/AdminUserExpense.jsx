import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const AdminUserExpense = () => {
  const currentDate = new Date();
  const formattedToday = currentDate.toISOString().split("T")[0]; // Format today as YYYY-MM-DD

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [filter, setFilter] = useState("today");
  const [date, setDate] = useState(formattedToday);
  const [expenseData, setExpenseData] = useState([]);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchExpenseData();
  }, []);

  useEffect(() => {
    fetchExpenseData();
  }, [filter, date, month, year]);

  const fetchExpenseData = async () => {
    try {
      const response = await axios.get(
        "/api/admin-usermangement/admin-expense-user",
        {
          params: { filter, date, month, year },
        }
      );
      setExpenseData(response.data);
      renderChart(response.data);
    } catch (error) {
      console.error("Error fetching expense data:", error);
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
            label: "Total Expenses",
            data: data.map((entry) => entry.totalExpense),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
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
    <div className="p-6 bg-gray-900 text-white min-h-screen pt-20">
      <h1 className="text-2xl font-bold mb-4 text-center">
        User Expense Report
      </h1>
      <div className="flex justify-center space-x-4 mb-6">
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

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
        {expenseData.length > 0 ? (
          <canvas ref={canvasRef} className="w-full h-96"></canvas>
        ) : (
          <p className="text-gray-400 text-lg text-center">No Data Available</p>
        )}
      </div>
    </div>
  );
};

export default AdminUserExpense;
