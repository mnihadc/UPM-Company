import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

function PrivateAdminRoute() {
  const { currentUser } = useSelector((state) => state.user);

  return currentUser && currentUser.user.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
}

export default PrivateAdminRoute;
