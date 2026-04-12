import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role — redirect to correct portal
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin")  return <Navigate to="/admin/dashboard"  replace />;
    if (user.role === "staff")  return <Navigate to="/staff/home"       replace />;
    if (user.role === "member") return <Navigate to="/member/dashboard" replace />;
  }

  return children;
}