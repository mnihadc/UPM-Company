import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const motivationalQuotes = [
  "Success is not the key to happiness. Happiness is the key to success!",
  "Dream big and dare to fail.",
  "The secret of getting ahead is getting started.",
  "Hard work beats talent when talent doesn’t work hard.",
  "Believe in yourself and all that you are!",
];

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [leader, setLeader] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true); // Start loading
      try {
        const { data } = await axios.get(
          `/api/sales/leaderboard?month=${month}&year=${year}`
        );
        setUsers(data.users);
        setLeader(data.leader);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
      setLoading(false); // Stop loading
    };
    fetchLeaderboard();
  }, [month, year]);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white pt-20">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
        Sales Leaderboard
      </h1>
      <div className="w-48 h-1 bg-blue-500 mx-auto mb-6 rounded"></div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search username or email"
          className="p-2 rounded bg-gray-800 border border-gray-600 w-full sm:w-auto"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          onChange={(e) => setMonth(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full sm:w-auto"
        >
          <option value="">Select Month</option>
          {months.map((name, index) => (
            <option key={index} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setYear(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full sm:w-auto"
        >
          <option value="">Select Year</option>
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Link to="/chart-view-leaderboard">
          <button className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold">
            📊 View in Chart
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ClipLoader color="#FFD700" size={50} />
        </div>
      ) : (
        <>
          {leader && (
            <div className="mb-6 p-4 bg-yellow-500 text-black rounded-lg text-center max-w-md mx-auto">
              <h2 className="text-2xl font-bold">Overall Leader</h2>
              <p className="text-lg font-semibold">{leader.username}</p>
              <p className="text-lg">OMR: {leader.totalSales}</p>
              <p className="text-sm">{leader.email}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const actualRank = users.findIndex((u) => u._id === user._id) + 1;

              return (
                <div
                  key={user._id}
                  className="relative p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
                >
                  <div className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-[#FF6B00] via-[#FF4500] to-[#D63400] text-white font-bold rounded-full">
                    {actualRank}
                  </div>
                  <img
                    src={
                      user.profilePic ||
                      "https://media.istockphoto.com/id/610003972/vector/vector-businessman-black-silhouette-isolated.jpg?s=612x612&w=0&k=20&c=Iu6j0zFZBkswfq8VLVW8XmTLLxTLM63bfvI6uXdkacM="
                    }
                    alt={user.username}
                    className="w-16 h-16 rounded-full"
                  />
                  <h3 className="text-xl font-semibold mt-2">
                    {user.username}
                  </h3>
                  <p className="text-center text-green-400 font-bold">
                    Total Sales: OMR {user.totalSales}
                  </p>
                  <p className="text-center text-gray-400 text-sm">
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-300 mt-2 text-center italic">
                    {user._id === leader?._id
                      ? `${user.username}, you're the best employee overall! 🎉`
                      : `${user.username}, ${
                          motivationalQuotes[
                            Math.floor(
                              Math.random() * motivationalQuotes.length
                            )
                          ]
                        }`}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
