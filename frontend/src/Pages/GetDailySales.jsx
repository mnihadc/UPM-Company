import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const GetDailySales = () => {
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser?.user?.username;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedRow, setExpandedRow] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(""); // Start Date
  const [endDate, setEndDate] = useState(""); // End Date

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      let query = "";
      if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(`/api/sales/get-daily-sales${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setSalesData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 pt-20">
      <div className="max-w-6xl mx-auto bg-gray-800 p-3 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">User: {username}</h1>
          <div className="flex space-x-2">
            <input
              type="date"
              className="bg-gray-700 text-white p-2 rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="bg-gray-700 text-white p-2 rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              onClick={fetchSalesData}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
            >
              Filter
            </button>
          </div>
          <span className="text-lg font-medium">
            {currentTime.toLocaleString()}
          </span>
          <Link to="/get-daily-sales-chart">
            <button className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold">
              📊 View in Chart
            </button>
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-700 rounded-lg">
                <thead className="bg-gray-700 text-gray-300">
                  <tr>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Total Expense</th>
                    <th className="p-3">Total Sales</th>
                    <th className="p-3">Total Profit</th>
                    <th className="p-3 text-center">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale, index) => (
                    <React.Fragment key={sale._id}>
                      <tr className="border-b border-gray-700 hover:bg-gray-700 transition">
                        <td className="p-3">
                          {new Date(sale.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">OMR: {sale.totalExpense}</td>
                        <td className="p-3">OMR: {sale.totalSales}</td>
                        <td className="p-3">OMR: {sale.totalProfit}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === index ? null : index
                              )
                            }
                            className="bg-gray-600 hover:bg-gray-500 p-2 rounded-full"
                          >
                            {expandedRow === index ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Customer Section */}
                      {expandedRow === index && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={5} className="p-2">
                            <div className="border-2 border-blue-500 bg-gray-800 p-2 rounded-lg shadow-md">
                              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                Customer Details
                              </h3>
                              <table className="w-full border border-gray-700">
                                <thead className="bg-gray-700">
                                  <tr>
                                    <th className="p-3">File</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Sales</th>
                                    <th className="p-3">Profit</th>
                                    <th className="p-3">Credit</th>
                                    <th className="p-3">Expense</th>
                                    <th className="p-3">VAT</th>
                                    <th className="p-3">Parts</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sale.customers.map((customer) => (
                                    <tr
                                      key={customer._id}
                                      className="border-b border-gray-700 hover:bg-gray-600"
                                    >
                                      <td className="p-3">{customer.file}</td>
                                      <td className="p-3">{customer.name}</td>
                                      <td className="p-3">
                                        {customer.description}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.sales}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.profit}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.credit}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.expense}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.vat}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.parts}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {salesData.length === 0 && (
                <p className="text-center text-gray-400 mt-4">
                  No sales found for the latest date.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GetDailySales;
