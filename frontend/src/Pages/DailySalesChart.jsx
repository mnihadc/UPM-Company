import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import moment from "moment";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GetDailySalesChart = () => {
  const [chartData, setChartData] = useState(null);

  const [startDate, setStartDate] = useState(
    moment().subtract(7, "days").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [month, setMonth] = useState(moment().format("YYYY-MM"));

  useEffect(() => {
    const fetchSales = async () => {
      try {
        console.log("Fetching data for:", startDate, endDate, month);

        // If no specific date range is selected, use the month filter
        const params = {};
        if (startDate && endDate) {
          params.startDate = moment(startDate).format("YYYY-MM-DD");
          params.endDate = moment(endDate).format("YYYY-MM-DD");
        } else if (month) {
          params.month = month;
        }

        const response = await axios.get("/api/sales/daily-sales-chart", {
          params,
          withCredentials: true,
        });

        const salesData = response.data;
        const labels = salesData.map((item) => item.date);
        const totalSales = salesData.map((item) => item.totalSales);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Sales",
              data: totalSales,
              borderColor: "#4F46E5",
              backgroundColor: "rgba(79, 70, 229, 0.2)",
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSales();
  }, [startDate, endDate, month]); // Dependencies

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl">
        <h2 className="text-xl font-semibold mb-4 text-center">Sales Growth</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {/* Date Range Filter */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded-md border border-gray-700 bg-gray-800 text-white"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded-md border border-gray-700 bg-gray-800 text-white"
            />
          </div>

          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 rounded-md border border-gray-700 bg-gray-800 text-white"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const monthYear = moment()
                .subtract(i, "months")
                .format("YYYY-MM");
              return (
                <option key={monthYear} value={monthYear}>
                  {moment(monthYear).format("MMMM YYYY")}
                </option>
              );
            })}
          </select>
        </div>

        {/* Chart */}
        {chartData ? (
          <div className="w-full h-[400px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: "top" } },
                interaction: { intersect: false },
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: {
                    title: { display: true, text: "Total Sales (OMR)" },
                    ticks: {
                      callback: (value) => `${value.toLocaleString()} OMR`,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-center text-gray-400">Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default GetDailySalesChart;
