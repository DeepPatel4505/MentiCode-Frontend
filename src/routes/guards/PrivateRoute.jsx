import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const isAuth = !!user;
  return isAuth ? children : <Navigate to="/login" replace />;
}
