import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth, selectIsAdmin } from "@/app/store/slices/authSlice";

export default function AdminRoute({ children }) {
  const isAuth  = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  if (!isAuth)  return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
