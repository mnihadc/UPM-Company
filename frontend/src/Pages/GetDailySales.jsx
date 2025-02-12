import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const GetDailySales = () => {
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser?.user?.username;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedRow, setExpandedRow] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("/api/sales/get-daily-sales", {
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
      }
    };

    fetchSalesData();
  }, []);

  // Filter sales data based on search and selected date
  const filteredSalesData = salesData.filter((sale) => {
    const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];

    // Check if sale matches the selected date (if any)
    const dateMatch = selectedDate ? saleDate === selectedDate : true;

    // Check if any customer name matches the search query
    const nameMatch = searchQuery
      ? sale.customers.some((customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true;

    return dateMatch && nameMatch;
  });

  return (
    <div>
      <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
        <div className="max-w-6xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">User: {username}</h1>
            <span className="text-lg font-medium">
              {currentTime.toLocaleString()}
            </span>
          </div>

          {/* Search & Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 w-full sm:w-1/2 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-gray-500"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 w-full sm:w-1/3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {/* Table */}
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
                {filteredSalesData.map((sale, index) => (
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
                            setExpandedRow(expandedRow === index ? null : index)
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
                        <td colSpan={5} className="p-4">
                          <div className="border-2 border-blue-500 bg-gray-800 p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">
                              Customer Details
                            </h3>
                            <table className="w-full border border-gray-700">
                              <thead className="bg-gray-700">
                                <tr>
                                  <th className="p-3">Name</th>
                                  <th className="p-3">Sales</th>
                                  <th className="p-3">Profit</th>
                                  <th className="p-3">Credit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.customers
                                  .filter((customer) =>
                                    customer.name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  )
                                  .map((customer) => (
                                    <tr
                                      key={customer._id}
                                      className="border-b border-gray-700 hover:bg-gray-600"
                                    >
                                      <td className="p-3">{customer.name}</td>
                                      <td className="p-3">
                                        OMR: {customer.sales}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.profit}
                                      </td>
                                      <td className="p-3">
                                        OMR: {customer.credit}
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

            {/* No Results Found */}
            {filteredSalesData.length === 0 && (
              <p className="text-center text-gray-400 mt-4">
                No matching sales found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetDailySales;
