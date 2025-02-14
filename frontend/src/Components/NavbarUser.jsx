import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";

const NavbarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const isAdmin = currentUser?.user?.isAdmin === true;
  const isUser = currentUser?.user?.isAdmin === false;

  // Default profile image
  const defaultProfilePic =
    "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";

  return (
    <nav className="bg-blue-800 text-gray-900 p-4 shadow-md fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold text-white">
          {isAdmin ? "UPM Company Admin" : "UPM Company"}
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-white transition font-bold">
            Home
          </Link>
          {isUser && (
            <>
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
                to="/usermangement"
                className="hover:text-white transition font-bold"
              >
                UserManagement
              </Link>
              <Link
                to="/profit-chart"
                className="hover:text-white transition font-bold"
              >
                Profit Chart
              </Link>
              <Link
                to="/sales-chart"
                className="hover:text-white transition font-bold"
              >
                Sales-Chart
              </Link>
            </>
          )}

          {/* Profile Section */}
          <Link to="/profile" className="flex items-center space-x-2">
            {currentUser ? (
              <img
                className="rounded-full h-8 w-8 object-cover border border-gray-300"
                src={currentUser.profilePic || defaultProfilePic}
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
          <Link
            to="/"
            className="hover:text-white transition font-bold"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {isUser && (
            <>
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
                to="/usermangement"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                UserManagement
              </Link>
              <Link
                to="/profit-chart"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Profit-Chart
              </Link>
              <Link
                to="/sales-chart"
                className="hover:text-white transition font-bold"
                onClick={() => setIsOpen(false)}
              >
                Sales-Chart
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
                src={currentUser.profilePic || defaultProfilePic}
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
