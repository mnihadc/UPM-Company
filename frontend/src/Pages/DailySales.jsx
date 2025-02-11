import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const DailySalesForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser?.user?.username;
  const userId = currentUser?.user?.id;

  const [formData, setFormData] = useState({
    userId,
    totalSales: "",
    totalExpense: "",
    totalProfit: "",
    customers: [{ name: "", sales: "", profit: "", credit: "" }],
  });

  const [existingSales, setExistingSales] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTodaySales = async () => {
      try {
        const response = await axios.get(`/api/sales/today-sales/${userId}`, {
          withCredentials: true,
        });
        setExistingSales(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("No sales found for today.", error);
      }
    };

    fetchTodaySales();
  }, [userId]);

  const handleChange = (e, index = null, field = null) => {
    if (index !== null && field) {
      setFormData((prevData) => {
        const updatedCustomers = [...prevData.customers];
        updatedCustomers[index][field] = e.target.value;
        return { ...prevData, customers: updatedCustomers };
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const addCustomer = () => {
    setFormData((prevData) => ({
      ...prevData,
      customers: [
        ...prevData.customers,
        { name: "", sales: "", profit: "", credit: "" },
      ],
    }));
  };

  const removeCustomer = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      customers: prevData.customers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/sales/daily-sales", formData, {
        withCredentials: true,
      });
      Swal.fire("Success!", "Sales data submitted successfully!", "success");
      setExistingSales(formData);
    } catch (error) {
      Swal.fire("Error!", "Failed to submit sales data.", "error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 pt-[90px] pb-[30px]">
      <div className="w-full max-w-4xl p-6 bg-gray-900 shadow-lg rounded-lg overflow-auto">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">
            Logged in as: <span className="text-blue-400">{username}</span>
          </h2>
          <p className="text-sm text-gray-300">
            {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
          </p>
        </div>

        {existingSales && (
          <div className="mb-6 p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-bold">Today Sales Summary</h3>
            <p>Total Sales: {existingSales.totalSales} OMR</p>
            <p>Total Expense: {existingSales.totalExpense} OMR</p>
            <p>Total Profit: {existingSales.totalProfit} OMR</p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-center mb-6">
          Daily Sales Entry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["totalSales", "totalExpense", "totalProfit"].map((name, i) => (
              <div key={name}>
                <label className="block font-semibold">
                  {["Total Sales", "Total Expense", "Total Profit"][i]} (OMR)
                </label>
                <input
                  type="number"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
                />
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold">Customer Details</h2>
          {formData.customers.map((customer, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center border border-gray-700 p-3 rounded-md"
            >
              {["name", "sales", "profit", "credit"].map((field, i) => (
                <input
                  key={field}
                  type="text"
                  placeholder={
                    [
                      "Customer Name",
                      "Sales (OMR)",
                      "Profit (OMR)",
                      "Credit (OMR)",
                    ][i]
                  }
                  value={customer[field]}
                  onChange={(e) => handleChange(e, index, field)}
                  required
                  className="p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
                />
              ))}
              {formData.customers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCustomer(index)}
                  className="text-red-400 hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomer}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            + Add Customer
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md mt-4"
          >
            {loading
              ? "Submitting..."
              : existingSales
              ? "Update Sales Data"
              : "Submit Sales Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailySalesForm;
