import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth } from "@/app/store/slices/authSlice";
import { selectOnboarding } from "@/app/store/slices/gamificationSlice";

export function GuestRoute({ children }) {
  const isAuth = useSelector(selectIsAuth);
  return !isAuth ? children : <Navigate to="/dashboard" replace />;
}

// Redirects to onboarding if not completed yet
export function OnboardRoute({ children }) {
  const onboarding = useSelector(selectOnboarding);
  return onboarding.completed ? children : <Navigate to="/onboarding" replace />;
}

export default GuestRoute;
