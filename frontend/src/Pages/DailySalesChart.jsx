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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get("/api/sales/daily-sales-chart", {
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

    // Detect screen size changes
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 ${
        isMobile ? "pt-20" : ""
      }`}
    >
      <div
        className={`w-full bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center ${
          isMobile ? "w-[100vw] h-[100vh] overflow-visible pt-5" : "max-w-4xl"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Sales Growth (Last 7 Days)
        </h2>

        {chartData ? (
          <div
            className={`flex justify-center items-center ${
              isMobile
                ? "transform rotate-90 w-[90vw] h-[90vh]" // Adjusted size for better visibility
                : "w-full h-[400px]"
            }`}
          >
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: "top" },
                },
                interaction: { intersect: false },
                scales: {
                  x: {
                    title: { display: true, text: "Date" },
                    ticks: { autoSkip: false, maxTicksLimit: 6 },
                  },
                  y: {
                    title: { display: true, text: "Total Sales (OMR)" },
                    ticks: {
                      autoSkip: false,
                      maxTicksLimit: 6, // Reduce tick density
                      padding: 10, // Adds spacing for visibility
                      callback: (value) => `${value.toLocaleString()} OMR`, // Formats numbers
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
