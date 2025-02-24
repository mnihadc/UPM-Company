import { useDispatch } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signoutUserSuccess } from "../Redux/user/userSlice"; // Import logout action

function PrivateRoute() {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          method: "GET",
          credentials: "include", // ✅ Allows cookies to be sent with request
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          dispatch(signoutUserSuccess());
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth Check Error:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isAuthenticated === null) return null; // Prevent flickering while checking auth

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
