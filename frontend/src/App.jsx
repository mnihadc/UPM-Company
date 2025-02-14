import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
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
import GetDailySales from "./Pages/GetDailySales";
import DailySalesChart from "./Pages/DailySalesChart";
import CreditUsers from "./Pages/CreditUsers";
import NavbarUser from "./Components/NavbarUser";
import Leaderboard from "./Pages/LeaderBoard";
import LeaderboardChart from "./Components/LeaderBoardChart";
import AdminProfitChart from "./Pages/AdminProfit";
function App() {
  return (
    <BrowserRouter>
      <NavbarUser />
      <div className="pb-7 pt-5 bg-black">
        {/* Add NavbarUser conditionally for authenticated users */}
        <Routes>
          {/* User Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/daily-sales" element={<DailySales />} />
            <Route path="/get-daily-sales" element={<GetDailySales />} />
            <Route
              path="/get-daily-sales-chart"
              element={<DailySalesChart />}
            />
            <Route path="/users-credit" element={<CreditUsers />} />
            <Route path="/leader-board" element={<Leaderboard />} />
            <Route
              path="/chart-view-leaderboard"
              element={<LeaderboardChart />}
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateAdminRoute />}>
            <Route path="/usermangement" element={<UserManagement />} />
            <Route path="/profit-chart" element={<AdminProfitChart />} />
          </Route>

          {/* Auth Routes */}
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
