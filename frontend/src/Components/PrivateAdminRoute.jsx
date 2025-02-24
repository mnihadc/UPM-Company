import { useDispatch } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signoutUserSuccess } from "../Redux/user/userSlice"; // Import logout action

function PrivateAdminRoute() {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          method: "GET",
          credentials: "include", // ✅ Allows cookies to be sent with request
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user?.isAdmin || false); // ✅ Ensure user is admin
        } else {
          dispatch(signoutUserSuccess());
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth Check Error:", error);
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isAdmin === null) return null; // Prevent flickering while checking auth

  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateAdminRoute;
