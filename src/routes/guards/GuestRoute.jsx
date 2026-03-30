import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import useCourse from "@/features/course/hooks/useCourse";

export function GuestRoute({ children }) {
  const { user } = useAuth();
  const isAuth = !!user;
  return !isAuth ? children : <Navigate to="/dashboard" replace />;
}

// Redirects to onboarding if not completed yet
export function OnboardRoute({ children }) {
  const { onboarding } = useCourse();
  return onboarding.completed ? children : <Navigate to="/onboarding" replace />;
}

export default GuestRoute;
