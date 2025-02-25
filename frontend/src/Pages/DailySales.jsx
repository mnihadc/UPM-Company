import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const DailySalesForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser?.user?.username;
  const userId = currentUser?.user?.id;

  const [formData, setFormData] = useState({
    userId,
    companyName: "",
    totalSales: 0,
    totalExpense: 0,
    totalProfit: 0,
    customers: [],
  });

  const [existingSales, setExistingSales] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

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

        if (response.data) {
          setExistingSales(response.data);
          setFormData(response.data);
        }
      } catch (error) {
        console.error("No sales found for today.", error);
      }
    };

    fetchTodaySales();
  }, [userId]);

  const addCustomer = () => {
    setFormData((prevData) => {
      const updatedCustomers = [
        ...prevData.customers,
        {
          file: "",
          name: "",
          description: "",
          sales: "",
          profit: "",
          expense: "",
          credit: "",
          vat: "",
          parts: "",
        },
      ];
      return calculateTotals({ ...prevData, customers: updatedCustomers });
    });
  };

  const removeCustomer = (index) => {
    setFormData((prevData) => {
      const updatedCustomers = prevData.customers.filter((_, i) => i !== index);
      return calculateTotals({ ...prevData, customers: updatedCustomers });
    });
  };

  const handleCustomerChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedCustomers = [...prevData.customers];
      updatedCustomers[index][field] = value;
      return calculateTotals({ ...prevData, customers: updatedCustomers });
    });
  };

  const calculateTotals = (data) => {
    const totalSales = data.customers.reduce(
      (sum, c) => sum + Number(c.sales || 0),
      0
    );
    const totalExpense = data.customers.reduce(
      (sum, c) => sum + Number(c.expense || 0),
      0
    );
    const totalProfit = data.customers.reduce(
      (sum, c) => sum + Number(c.profit || 0),
      0
    );
    return { ...data, totalSales, totalExpense, totalProfit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existingSales) {
        await axios.put("/api/sales/daily-sales", formData, {
          withCredentials: true,
        });
        Swal.fire("Success!", "Sales data updated successfully!", "success");
      } else {
        await axios.post("/api/sales/daily-sales", formData, {
          withCredentials: true,
        });
        Swal.fire("Success!", "Sales data submitted successfully!", "success");
      }
      setExistingSales(formData);
    } catch (error) {
      Swal.fire("Error!", "Failed to submit sales data.", "error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-2 pt-[60px] pb-[30px]">
      <div className="w-full max-w-4xl p-3 bg-gray-900 shadow-lg rounded-lg overflow-auto">
        <h2 className="text-lg font-bold text-center mb-4">
          Logged in as: {username}
        </h2>
        <p className="text-sm text-gray-300 text-center mb-4">
          {dateTime.toLocaleString()}
        </p>
        <h1 className="text-2xl font-bold text-center mb-6">
          Daily Sales Entry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["Total Sales", "Total Expense", "Total Profit"].map(
              (label, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-700 rounded-md bg-gray-800 text-center"
                >
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-xl text-blue-400">
                    {formData[
                      ["totalSales", "totalExpense", "totalProfit"][i]
                    ].toFixed(2)}{" "}
                    OMR
                  </p>
                </div>
              )
            )}
          </div>

          <h2 className="text-lg font-semibold">Customer Details</h2>
          {formData.customers.map((customer, index) => (
            <div
              key={index}
              className="mb-2 border border-gray-700 rounded-md p-3"
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === index ? null : index)}
                className="w-full text-left font-semibold text-blue-400"
              >
                {customer.name || `Customer ${index + 1}`}
              </button>
              {expanded === index && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  {[
                    "file",
                    "name",
                    "description",
                    "sales",
                    "profit",
                    "expense",
                    "credit",
                    "vat",
                    "parts",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-400">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={customer[field]}
                        onChange={(e) =>
                          handleCustomerChange(index, field, e.target.value)
                        }
                        required
                        className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
                      />
                    </div>
                  ))}
                  {!existingSales?.customers.some(
                    (c) => c.name === customer.name
                  ) && (
                    <button
                      type="button"
                      onClick={() => removeCustomer(index)}
                      className="text-red-400 hover:text-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md mt-4 flex items-center justify-center"
          >
            {loading ? (
              <ClipLoader color="#fff" size={20} />
            ) : existingSales ? (
              "Update Sales Data"
            ) : (
              "Submit Sales Data"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailySalesForm;
