import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const managementRoles = new Set(["ADMIN", "THEATRE_MANAGER"]);

export default function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!managementRoles.has(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
