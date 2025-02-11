import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import SignupForm from "./Pages/SignUp";
import EmailVerify from "./Components/EmailVerify";
import PandaLogin from "./Pages/Login";
import PrivateRoute from "./Components/PrivateRoute";
import PrivateAdminRoute from "./Components/PrivateAdminRoute";
import UserManagement from "./Pages/UserManagement";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Components/ForgotPassword";
import OTP from "./Components/OTP";
import DailySales from "./Pages/DailySales";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pb-7 pt-5 bg-black">
        {" "}
        {/* Adds padding to avoid navbar overlap */}
        <Routes>
          {/*User Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/daily-sales" element={<DailySales />} />
          </Route>
          {/*Admin Routes */}
          <Route element={<PrivateAdminRoute />}>
            <Route path="/usermangement" element={<UserManagement />} />
          </Route>
          {/*Auth Routes */}
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<PandaLogin />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/forgotpassword-email" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OTP />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
