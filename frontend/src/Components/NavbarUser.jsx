import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";

const NavbarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  // Default profile image
  const defaultProfilePic =
    "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";

  return (
    <nav className="bg-blue-800 text-gray-200 p-4 shadow-md fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold text-white">
          UPM Company
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-white transition">
            Home
          </Link>
          <Link to="/daily-sales" className="hover:text-white transition">
            Entry Daily Sales
          </Link>
          <Link to="/get-daily-sales" className="hover:text-white transition">
            Daily Sales
          </Link>
          <Link
            to="/get-daily-sales-chart"
            className="hover:text-white transition"
          >
            Daily Sales Chart
          </Link>
          <Link to="/users-credit" className="hover:text-white transition">
            Credit
          </Link>

          {/* Profile Section */}
          <Link to="/profile" className="flex items-center space-x-2">
            {currentUser ? (
              <img
                className="rounded-full h-8 w-8 object-cover border border-gray-300"
                src={currentUser.profilePic || defaultProfilePic}
                alt="profile"
              />
            ) : (
              <span className="hover:text-white transition">Login</span>
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
            className="hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/entry-daily-sales"
            className="hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Entry Daily Sales
          </Link>
          <Link
            to="/daily-sales"
            className="hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Daily Sales
          </Link>
          <Link
            to="/daily-sales-chart"
            className="hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Daily Sales Chart
          </Link>
          <Link
            to="/credit"
            className="hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Credit
          </Link>

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
              <span className="text-white hover:underline transition">
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
