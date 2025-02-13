import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const months = [
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

const LeaderboardChart = () => {
  const [users, setUsers] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/sales/leaderboard?month=${month}&year=${year}`
        );
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [month, year]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768; // Rotate chart for mobile

  const chartData = {
    labels: users.map((user) => user.username),
    datasets: [
      {
        label: "Total Sales (OMR)",
        data: users.map((user) => user.totalSales),
        backgroundColor: "rgba(255, 165, 0, 0.8)",
        borderColor: "rgba(255, 140, 0, 1)",
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: "rgba(255, 140, 0, 1)",
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white pt-20 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
        Sales Leaderboard (Bar Chart)
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 w-full max-w-xl">
        <select
          onChange={(e) => setMonth(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full sm:w-auto border border-gray-600"
        >
          <option value="">Overall (All Time)</option>
          {months.map((name, index) => (
            <option key={index} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setYear(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full sm:w-auto border border-gray-600"
        >
          <option value="">Overall (All Years)</option>
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-lg mt-10">No sales data available.</p>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
            {/* Scrollable Chart */}
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: isMobile ? "y" : "x", // Rotate chart for mobile
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { beginAtZero: true },
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardChart;
