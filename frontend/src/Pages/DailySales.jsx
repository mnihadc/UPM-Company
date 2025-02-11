import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Import Redux hook
import axios from "axios";

const DailySalesForm = () => {
  // Get username from Redux
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser.user.username;
  // State for form data
  const [formData, setFormData] = useState({
    totalSales: "",
    totalExpense: "",
    totalProfit: "",
    customers: [{ name: "", sales: "", profit: "", credit: "" }],
  });

  // State for current date and time
  const [dateTime, setDateTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle input change
  const handleChange = (e, index = null, field = null) => {
    if (index !== null && field) {
      const updatedCustomers = [...formData.customers];
      updatedCustomers[index][field] = e.target.value;
      setFormData({ ...formData, customers: updatedCustomers });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Add new customer row
  const addCustomer = () => {
    setFormData({
      ...formData,
      customers: [
        ...formData.customers,
        { name: "", sales: "", profit: "", credit: "" },
      ],
    });
  };

  // Remove customer row
  const removeCustomer = (index) => {
    const updatedCustomers = formData.customers.filter((_, i) => i !== index);
    setFormData({ ...formData, customers: updatedCustomers });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/dailysales", formData);
      alert("Sales data submitted successfully!");
      setFormData({
        totalSales: "",
        totalExpense: "",
        totalProfit: "",
        customers: [{ name: "", sales: "", profit: "", credit: "" }],
      });
    } catch (error) {
      console.error("Error submitting sales data:", error);
      alert("Failed to submit sales data.");
    }
  };

  return (
    <div className="h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-3xl p-6 bg-gray-900 shadow-lg rounded-lg mt-4">
        {/* Display username and date-time */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">
            Logged in as: <span className="text-blue-400">{username}</span>
          </h2>
          <p className="text-sm text-gray-300">
            {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
          </p>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">
          Daily Sales Entry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sales Summary Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Sales (OMR)", name: "totalSales" },
              { label: "Total Expense (OMR)", name: "totalExpense" },
              { label: "Total Profit (OMR)", name: "totalProfit" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block font-semibold">{label}</label>
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

          {/* Customer Sales Details */}
          <h2 className="text-lg font-semibold">Customer Details</h2>
          {formData.customers.map((customer, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center border border-gray-700 p-3 rounded-md"
            >
              {[
                { placeholder: "Customer Name", field: "name" },
                { placeholder: "Sales (OMR)", field: "sales" },
                { placeholder: "Profit (OMR)", field: "profit" },
                { placeholder: "Credit (OMR)", field: "credit" },
              ].map(({ placeholder, field }) => (
                <input
                  key={field}
                  type="text"
                  placeholder={placeholder}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md mt-4"
          >
            Submit Sales Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailySalesForm;
