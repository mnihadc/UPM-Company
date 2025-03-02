import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

const NavbarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const isAdmin = currentUser?.user?.isAdmin === true;
  const isUser = currentUser?.user?.isAdmin === false;

  // Default profile image
  const defaultProfilePic =
    "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  return (
    <nav className="bg-blue-800 text-gray-900 p-4 shadow-md fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="#" className="flex items-center space-x-2">
          <img
            src="/upm_world-logo.png"
            alt="UPM World"
            className="h-10 w-10 object-contain"
          />
          <span className="text-2xl font-semibold text-white">
            {isAdmin ? "UPM_World Company Admin" : "UPM_World Company"}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          {isUser && (
            <>
              <Link to="/" className="hover:text-white transition font-bold">
                Home
              </Link>
              <Link
                to="/leader-board"
                className="hover:text-white transition font-bold"
              >
                LeaderBoard
              </Link>
              <Link
                to="/daily-sales"
                className="hover:text-white transition font-bold"
              >
                Entry Daily Sales
              </Link>
              <Link
                to="/get-daily-sales"
                className="hover:text-white transition font-bold"
              >
                Daily Sales
              </Link>
              <Link
                to="/users-credit"
                className="hover:text-white transition font-bold"
              >
                Credit
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                to="/admin-dashboard"
                className="hover:text-white transition font-bold"
              >
                Home
              </Link>
              <Link
                to="/usermangement"
                className="hover:text-white transition font-bold"
              >
                UserManagement
              </Link>
              <Link
                to="/leader-board"
                className="hover:text-white transition font-bold"
              >
                LeaderBoard
              </Link>
              <Link
                to="/admin-chart"
                className="hover:text-white transition font-bold"
              >
                Sales-Chart
              </Link>
              <Link
                to="/admin-user-chart"
                className="hover:text-white transition font-bold"
              >
                User-Chart
              </Link>
              <Link
                to="/admin-daily-sales"
                className="hover:text-white transition font-bold"
              >
                Sales-Table
              </Link>
              <Link
                to="/admin-leave-application"
                className="hover:text-white transition font-bold"
              >
                Leave-Application
              </Link>
            </>
          )}

          {/* Profile Section */}
          <Link to="/profile" className="flex items-center space-x-2">
            {currentUser ? (
              <img
                className="rounded-full h-8 w-8 object-cover border border-gray-300"
                src={userData?.avatar || defaultProfilePic}
                alt="profile"
              />
            ) : (
              <span className="hover:text-white transition font-bold">
                Login
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-blue-800 py-2 space-y-3">
          {isUser && (
            <>
              <Link
                to="/"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/leader-board"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                LeaderBoard
              </Link>
              <Link
                to="/daily-sales"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Entry Daily Sales
              </Link>
              <Link
                to="/get-daily-sales"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Daily Sales
              </Link>
              <Link
                to="/users-credit"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Credit
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                to="/admin-dashboard"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/usermangement"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                UserManagement
              </Link>
              <Link
                to="/leader-board"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                LeaderBoard
              </Link>
              <Link
                to="/admin-chart"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Sales-Chart
              </Link>
              <Link
                to="/admin-user-chart"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                User-Chart
              </Link>
              <Link
                to="/admin-daily-sales"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Sales-Table
              </Link>
              <Link
                to="/admin-leave-application"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Leave-Application
              </Link>
            </>
          )}
          {/* Profile Section */}
          <Link
            to="/profile"
            className="flex items-center space-x-2"
            onClick={() => setIsOpen(false)}
          >
            {currentUser ? (
              <img
                className="rounded-full h-8 w-8 object-cover border border-gray-300"
                src={userData?.avatar || defaultProfilePic}
                alt="profile"
              />
            ) : (
              <span className="text-white hover:underline transition font-bold">
                Login
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavbarUser;
