import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

const AdminDailySales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const query = `?date=${selectedDate}`;
      const response = await fetch(
        `/api/admin-usermangement/get-admin-daily-sales-data${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
  }, [selectedDate]);

  const filteredSales = salesData.filter(
    (sale) =>
      sale.userId?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.userId?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (sale) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const username = sale.userId?.username || "user";
      const date = new Date(sale.createdAt).toISOString().split("T")[0];
      const filename = `${username}_${date}.${downloadFormat}`;

      let downloadUrl = "";

      if (downloadFormat === "pdf") {
        downloadUrl = `/api/user/admin-daily-sales-pdf/${sale._id}`;
      } else if (downloadFormat === "xlsx") {
        downloadUrl = `/api/user/admin-daily-sales-excel/${sale._id}`;
      }

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 pt-20">
      <div className="max-w-6xl mx-auto bg-gray-800 p-3 rounded-lg shadow-xl">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold">Admin Daily Sales</h1>
          <input
            type="date"
            className="bg-gray-700 text-white p-2 rounded-lg"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by username or email"
            className="bg-gray-700 text-white p-2 rounded-lg w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredSales.length === 0 ? (
              <div className="text-center text-gray-400 p-4">
                No data available for the selected date.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-700 rounded-lg">
                  <thead className="bg-gray-700 text-gray-300">
                    <tr>
                      <th className="p-3">Username</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Total Expense</th>
                      <th className="p-3">Total Sales</th>
                      <th className="p-3">Total Profit</th>
                      <th className="p-3 text-center">Customers</th>
                      <th className="p-3">
                        <select
                          className="bg-gray-700 text-white p-2 rounded-lg"
                          value={downloadFormat}
                          onChange={(e) => setDownloadFormat(e.target.value)}
                        >
                          <option value="pdf">PDF</option>
                          <option value="xlsx">Excel</option>
                        </select>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <React.Fragment key={sale._id}>
                        <tr className="border-b border-gray-700 hover:bg-gray-700 transition">
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {sale.userId?.username}
                              </span>
                              <span className="text-sm text-gray-400">
                                {sale.userId?.email}
                              </span>
                            </div>
                          </td>
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
                          <td className="p-3">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => handleDownload(sale)}
                            >
                              <Download size={24} />
                            </button>
                          </td>
                        </tr>
                        {expandedRow === index && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={6} className="p-2">
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
                                      <th className="p-3">Sales (OMR)</th>
                                      <th className="p-3">Profit (OMR)</th>
                                      <th className="p-3">Credit (OMR)</th>
                                      <th className="p-3">Expense (OMR)</th>
                                      <th className="p-3">VAT (OMR)</th>
                                      <th className="p-3">Parts (OMR)</th>
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
                                          {customer.description || "N/A"}
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
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDailySales;
