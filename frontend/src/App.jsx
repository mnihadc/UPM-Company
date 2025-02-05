import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import SignupForm from "./Pages/SignUp";
import EmailVerify from "./Components/EmailVerify";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pb-7 pt-5">
        {" "}
        {/* Adds padding to avoid navbar overlap */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignupForm />} />
          <Route path="/email-verify" element={<EmailVerify />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
