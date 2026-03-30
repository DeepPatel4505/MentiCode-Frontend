import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const isAuth = !!user;
  const isAdmin = user?.role === "admin";
  if (!isAuth)  return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
