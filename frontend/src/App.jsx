import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
import AdminSalesChart from "./Pages/AdminSales";
import CreditChart from "./Pages/AdminCredit";
import TotalExpenseChart from "./Pages/AdminExpense";
import AdminChart from "./Pages/AdminChart";
import AdminUserSales from "./Pages/AdminUserSales";
import AdminUserProfit from "./Pages/AdminUserProfit";
import AdminUserExpense from "./Pages/AdminUserExpense";
import AdminUserCredit from "./Pages/AdminUserCredit";
import AdminUserChart from "./Pages/AdminUserChart";
import AdminDailySales from "./Pages/AdminDailyTable";
import LeaveApplicationPage from "./Pages/LeaveUser";
import AdminLeavePage from "./Pages/AdminLeave";
import AdminDashboard from "./Pages/AdminDashboard";

function App() {
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.user?.isAdmin === true;

  return (
    <BrowserRouter>
      <NavbarUser />
      <div className="pb-7 pt-5 bg-black">
        <Routes>
          {/* Redirect based on user role */}
          <Route
            path="/"
            element={<Navigate to={isAdmin ? "/admin-dashboard" : "/home"} />}
          />

          {/* User Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
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
            <Route
              path="/leave-application-user"
              element={<LeaveApplicationPage />}
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateAdminRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/usermangement" element={<UserManagement />} />
            <Route path="/profit-chart" element={<AdminProfitChart />} />
            <Route path="/sales-chart" element={<AdminSalesChart />} />
            <Route path="/credit-chart" element={<CreditChart />} />
            <Route path="/expense-chart" element={<TotalExpenseChart />} />
            <Route path="/admin-chart" element={<AdminChart />} />
            <Route path="/admin-sales-user" element={<AdminUserSales />} />
            <Route path="/admin-profit-user" element={<AdminUserProfit />} />
            <Route path="/admin-expanse-user" element={<AdminUserExpense />} />
            <Route path="/admin-credit-user" element={<AdminUserCredit />} />
            <Route path="/admin-user-chart" element={<AdminUserChart />} />
            <Route path="/admin-daily-sales" element={<AdminDailySales />} />
            <Route
              path="/admin-leave-application"
              element={<AdminLeavePage />}
            />
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
