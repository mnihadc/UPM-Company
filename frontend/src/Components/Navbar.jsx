import { useState } from "react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <li>
          <a
            href="/login"
            className="text-white text-lg hover:underline border px-4 py-2 rounded-md border-white"
          >
            Login
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
