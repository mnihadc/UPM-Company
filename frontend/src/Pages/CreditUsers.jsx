import { useState, useEffect } from "react";
import axios from "axios";

const CreditUsers = () => {
  const [credits, setCredits] = useState([]);
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [search, setSearch] = useState("");
  const [totalCredit, setTotalCredit] = useState(0);
  const [lastMonthCredit, setLastMonthCredit] = useState(0);
  const [editing, setEditing] = useState(null);
  const [newCredit, setNewCredit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await axios.get("/api/sales/users-credits", {
          withCredentials: true,
        });
        const data = response.data;

        const total = data.reduce((sum, item) => sum + item.credit, 0);
        const lastMonthTotal = data.reduce(
          (sum, item) => sum + (item.lastMonthCredit || 0),
          0
        );

        setCredits(data);
        setFilteredCredits(data);
        setTotalCredit(total);
        setLastMonthCredit(lastMonthTotal);
      } catch (error) {
        console.error("Error fetching credit data:", error);
      }
    };

    fetchCredits();
  }, []);

  useEffect(() => {
    let filtered = credits.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((c) => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= start && createdAt <= end;
      });
    }

    setFilteredCredits(filtered);
  }, [search, credits, startDate, endDate]);

  const handleEdit = (id, credit) => {
    setEditing(id);
    setNewCredit(credit);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `/api/credits/${id}`,
        { credit: newCredit },
        { withCredentials: true }
      );
      setCredits(
        credits.map((c) => (c._id === id ? { ...c, credit: newCredit } : c))
      );
      setEditing(null);
    } catch (error) {
      console.error("Error updating credit:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-700 p-4 rounded-lg text-center">
            <h2 className="text-lg font-bold">Total Credit</h2>
            <p className="text-2xl font-semibold">
              {totalCredit.toLocaleString()} OMR
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <h2 className="text-lg font-bold">Last Month Credit</h2>
            <p className="text-2xl font-semibold">
              {lastMonthCredit.toLocaleString()} OMR
            </p>
          </div>
        </div>

        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded-md border border-gray-700 bg-gray-800 text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded-md border border-gray-700 bg-gray-800 text-white"
          />
        </div>

        <input
          type="text"
          placeholder="Search Company Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-white"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-700">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">Created Date</th>
                <th className="p-3">Company Name</th>
                <th className="p-3">Sales</th>
                <th className="p-3">Credit</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCredits
                .filter((c) => c.credit > 0)
                .map((c) => (
                  <tr key={c._id} className="border-b border-gray-700">
                    <td className="p-3">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.sales.toLocaleString()} OMR</td>
                    <td className="p-3">
                      {editing === c._id ? (
                        <input
                          type="number"
                          value={newCredit}
                          onChange={(e) => setNewCredit(e.target.value)}
                          className="p-2 w-20 bg-gray-800 border border-gray-600 text-white rounded-md"
                        />
                      ) : (
                        `${c.credit.toLocaleString()} OMR`
                      )}
                    </td>
                    <td className="p-3">
                      {editing === c._id ? (
                        <button
                          onClick={() => handleSave(c._id)}
                          className="bg-green-600 p-2 rounded-md"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(c._id, c.credit)}
                          className="bg-yellow-600 p-2 rounded-md"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditUsers;
