import { useState } from "react";
import AdminUserSales from "./AdminUserSales";
import AdminUserProfit from "./AdminUserProfit";
import AdminUserCredit from "./AdminUserCredit";
import AdminUserExpense from "./AdminUserExpense";

function AdminUserChart() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white pt-20">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Reports</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {["sales", "profit", "credit", "expense"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Report
          </button>
        ))}
      </div>

      {/* Render selected chart */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        {activeTab === "sales" && <AdminUserSales />}
        {activeTab === "profit" && <AdminUserProfit />}
        {activeTab === "credit" && <AdminUserCredit />}
        {activeTab === "expense" && <AdminUserExpense />}
      </div>
    </div>
  );
}

export default AdminUserChart;
