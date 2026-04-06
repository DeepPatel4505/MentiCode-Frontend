import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth } from "@/app/store/slices/authSlice";

/**
 * Protected — wraps routes that require authentication.
 * Used by analyze routes. Functionally identical to PrivateRoute.
 */
export default function Protected({ children }) {
  const isAuth = useSelector(selectIsAuth);
  return isAuth ? children : <Navigate to="/login" replace />;
}
