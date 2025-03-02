import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chart } from "chart.js/auto";
import { useSelector } from "react-redux";
import axios from "axios";

function Home() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({});
  const [todayData, setTodayData] = useState({});
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [previous7DaysData, setPrevious7DaysData] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser.user.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/user/user-dashboard-data", {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        const data = response.data;

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Yesterday

        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Filter data for the current month
        const monthlyData = data.filter(
          (entry) =>
            new Date(entry.createdAt).getMonth() + 1 === currentMonth &&
            new Date(entry.createdAt).getFullYear() === currentYear
        );

        // Calculate totals for the month
        const totalSales = monthlyData.reduce(
          (acc, entry) => acc + entry.totalSales,
          0
        );
        const totalProfit = monthlyData.reduce(
          (acc, entry) => acc + entry.totalProfit,
          0
        );
        const totalCredit = monthlyData.reduce(
          (acc, entry) =>
            acc +
            entry.customers.reduce((acc, customer) => acc + customer.credit, 0),
          0
        );
        const totalExpense = monthlyData.reduce(
          (acc, entry) => acc + entry.totalExpense,
          0
        );

        // Filter data for today and yesterday
        const todayData = data.filter(
          (entry) =>
            new Date(entry.createdAt).toDateString() === today.toDateString()
        );
        const yesterdayData = data.filter(
          (entry) =>
            new Date(entry.createdAt).toDateString() ===
            yesterday.toDateString()
        );

        // Calculate totals for today and yesterday
        const todaySales = todayData.reduce(
          (acc, entry) => acc + entry.totalSales,
          0
        );
        const todayProfit = todayData.reduce(
          (acc, entry) => acc + entry.totalProfit,
          0
        );
        const todayCredit = todayData.reduce(
          (acc, entry) =>
            acc +
            entry.customers.reduce((acc, customer) => acc + customer.credit, 0),
          0
        );
        const todayExpense = todayData.reduce(
          (acc, entry) => acc + entry.totalExpense,
          0
        );

        const yesterdaySales = yesterdayData.reduce(
          (acc, entry) => acc + entry.totalSales,
          0
        );
        const yesterdayProfit = yesterdayData.reduce(
          (acc, entry) => acc + entry.totalProfit,
          0
        );
        const yesterdayCredit = yesterdayData.reduce(
          (acc, entry) =>
            acc +
            entry.customers.reduce((acc, customer) => acc + customer.credit, 0),
          0
        );
        const yesterdayExpense = yesterdayData.reduce(
          (acc, entry) => acc + entry.totalExpense,
          0
        );

        // Calculate percentage change for today compared to yesterday
        const calculatePercentageChange = (todayValue, yesterdayValue) => {
          if (yesterdayValue === 0) return todayValue === 0 ? 0 : 100; // Avoid division by zero
          return (
            ((todayValue - yesterdayValue) / Math.abs(yesterdayValue)) * 100
          );
        };

        const salesPercentageChange = calculatePercentageChange(
          todaySales,
          yesterdaySales
        );
        const profitPercentageChange = calculatePercentageChange(
          todayProfit,
          yesterdayProfit
        );
        const creditPercentageChange = calculatePercentageChange(
          todayCredit,
          yesterdayCredit
        );
        const expensePercentageChange = calculatePercentageChange(
          todayExpense,
          yesterdayExpense
        );

        // Set monthly data
        setMonthlyData({
          totalSales,
          totalProfit,
          totalCredit,
          totalExpense,
        });

        // Set today's data and percentage changes
        setTodayData({
          todaySales,
          todayProfit,
          todayCredit,
          todayExpense,
          salesPercentageChange,
          profitPercentageChange,
          creditPercentageChange,
          expensePercentageChange,
        });

        // Filter data for the last 7 days and previous 7 days
        const last7Days = data.filter(
          (entry) =>
            (today - new Date(entry.createdAt)) / (1000 * 60 * 60 * 24) <= 7
        );
        const previous7Days = data.filter(
          (entry) =>
            (today - new Date(entry.createdAt)) / (1000 * 60 * 60 * 24) > 7 &&
            (today - new Date(entry.createdAt)) / (1000 * 60 * 60 * 24) <= 14
        );

        setLast7DaysData(last7Days);
        setPrevious7DaysData(previous7Days);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.token]);

  useEffect(() => {
    if (!loading) {
      const salesCanvas = document.getElementById("salesChart");
      const revenueCanvas = document.getElementById("revenueChart");

      if (salesCanvas && revenueCanvas) {
        // Destroy existing charts to avoid duplication
        if (salesCanvas.chart) salesCanvas.chart.destroy();
        if (revenueCanvas.chart) revenueCanvas.chart.destroy();

        const salesCtx = salesCanvas.getContext("2d");
        salesCanvas.chart = new Chart(salesCtx, {
          type: "bar",
          data: {
            labels: last7DaysData.map((entry) =>
              new Date(entry.createdAt).toLocaleDateString()
            ),
            datasets: [
              {
                label: "Sales",
                data: last7DaysData.map((entry) => entry.totalSales),
                backgroundColor: "rgba(255, 206, 86, 0.8)", // Yellow
              },
              {
                label: "Profit",
                data: last7DaysData.map((entry) => entry.totalProfit),
                backgroundColor: "rgba(75, 192, 192, 0.8)", // Green
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "white",
                },
              },
              y: {
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "white",
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "white",
                },
              },
            },
          },
        });

        const revenueCtx = revenueCanvas.getContext("2d");
        revenueCanvas.chart = new Chart(revenueCtx, {
          type: "bar",
          data: {
            labels: previous7DaysData.map((entry) =>
              new Date(entry.createdAt).toLocaleDateString()
            ),
            datasets: [
              {
                label: "Sales",
                data: previous7DaysData.map((entry) => entry.totalSales),
                backgroundColor: "rgba(54, 162, 235, 0.8)", // Blue
              },
              {
                label: "Profit",
                data: previous7DaysData.map((entry) => entry.totalProfit),
                backgroundColor: "rgba(75, 192, 192, 0.8)", // Green
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "white",
                },
              },
              y: {
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "white",
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "white",
                },
              },
            },
          },
        });
      }
    }
  }, [loading, last7DaysData, previous7DaysData]);

  if (loading) {
    return (
      <motion.div className="flex items-center justify-center h-screen bg-gray-900 text-white text-4xl font-bold">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            UPM
          </motion.div>
          <motion.div className="mt-4 border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <main className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-300">Welcome {username}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Sales (This Month)",
              value: monthlyData.totalSales,
              percentage: todayData.salesPercentageChange,
            },
            {
              title: "Total Profit (This Month)",
              value: monthlyData.totalProfit,
              percentage: todayData.profitPercentageChange,
            },
            {
              title: "Total Credit (This Month)",
              value: monthlyData.totalCredit,
              percentage: todayData.creditPercentageChange,
            },
            {
              title: "Total Expense (This Month)",
              value: monthlyData.totalExpense,
              percentage: todayData.expensePercentageChange,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-gray-400 text-sm">{item.title}</p>
              <h3 className="text-2xl font-semibold text-blue-400">
                {item.value}
              </h3>
              <p
                className={`text-sm ${
                  item.percentage >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {item.percentage >= 0 ? "+" : "-"}
                {Math.abs(item.percentage).toFixed(2)}% from yesterday
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Last 7 Days Sales & Profit
            </h3>
            <div className="h-64">
              <canvas id="salesChart"></canvas>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Previous 7 Days Sales & Profit
            </h3>
            <div className="h-64">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
