import { useState } from "react";
import CreditChart from "./AdminCredit";
import TotalExpenseChart from "./AdminExpense";
import AdminProfitChart from "./AdminProfit";
import AdminSalesChart from "./AdminSales";

function AdminChart() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className=" bg-gray-900 min-h-screen text-white pt-20">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Reports</h1>

      {/* Tabs */}
      <div className="p-3 flex justify-center space-x-4 mb-6">
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
      <div className="bg-gray-800 rounded-lg shadow-lg">
        {activeTab === "sales" && <AdminSalesChart />}
        {activeTab === "profit" && <AdminProfitChart />}
        {activeTab === "credit" && <CreditChart />}
        {activeTab === "expense" && <TotalExpenseChart />}
      </div>
    </div>
  );
}

export default AdminChart;
