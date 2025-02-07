import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  return (
    <nav className="bg-blue-800 p-4 flex justify-between items-center fixed w-full">
      <div className="text-2xl font-bold text-white">UPM_Company</div>

      {/* Hamburger Icon for mobile */}
      <div className="block lg:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      <ul
        className={`${
          isMenuOpen ? "block" : "hidden"
        } lg:flex gap-6 items-center`}
      >
        <li>
          <a href="/" className="text-white text-lg hover:underline">
            Home
          </a>
        </li>
        <li>
          <a href="#" className="text-white text-lg hover:underline">
            About
          </a>
        </li>
        <li>
          <a href="#" className="text-white text-lg hover:underline">
            Services
          </a>
        </li>
        <li>
          <a href="#" className="text-white text-lg hover:underline">
            Contact
          </a>
        </li>
        <Link to="/profile">
          {currentUser ? (
            <img
              className="rounded-full h-7 w-7 object-cover"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvG_T2e_jE-VxZCIkDp0h6wPskEtxsXcwbcA&s"
              alt="profile"
            />
          ) : (
            <li className="text-slate-700 hover:underline">Sign-In</li>
          )}
        </Link>
      </ul>
    </nav>
  );
}

export default Navbar;
