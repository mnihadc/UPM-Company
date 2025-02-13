import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chart } from "chart.js/auto";
import { useSelector } from "react-redux";
function Home() {
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser.user.username;
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const salesCanvas = document.getElementById("salesChart");
    const revenueCanvas = document.getElementById("revenueChart");

    if (salesCanvas && revenueCanvas) {
      const salesCtx = salesCanvas.getContext("2d");
      new Chart(salesCtx, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          datasets: [
            {
              label: "Target Sales",
              data: [4000, 5000, 6000, 8000, 10000, 12000, 14000],
              backgroundColor: "yellow",
            },
            {
              label: "Reality Sales",
              data: [3500, 4500, 5800, 7000, 9500, 11000, 13000],
              backgroundColor: "green",
            },
          ],
        },
      });

      const revenueCtx = revenueCanvas.getContext("2d");
      new Chart(revenueCtx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Online Sales",
              data: [10000, 14000, 18000, 12000, 16000, 20000, 22000],
              backgroundColor: "blue",
            },
            {
              label: "Offline Sales",
              data: [8000, 11000, 15000, 10000, 14000, 17000, 19000],
              backgroundColor: "green",
            },
          ],
        },
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <motion.div className="flex items-center justify-center h-screen bg-black text-white text-4xl font-bold">
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white pt-10">
      <main className="flex-1 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-300">Welcome {username}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {[
            "Total Sales",
            "Total Orders",
            "Products Sold",
            "New Customers",
          ].map((title, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <p className="text-gray-400">{title}</p>
              <h3 className="text-xl font-semibold text-blue-400">
                {Math.floor(Math.random() * 1000)}
              </h3>
              <p className="text-green-400 text-sm">
                +{Math.floor(Math.random() * 10)}% from yesterday
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Target vs Reality</h3>
            <canvas id="salesChart"></canvas>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <canvas id="revenueChart"></canvas>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
