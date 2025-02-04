import "../Css/Navbar.css"; // Import the CSS file

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">UPM_Company</div>
      <ul className="nav-links">
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">About</a>
        </li>
        <li>
          <a href="#">Services</a>
        </li>
        <li>
          <a href="#">Contact</a>
        </li>
        <li>
          <a href="#">Login</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
