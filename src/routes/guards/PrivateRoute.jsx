import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/axios";
import {
  clearAuth,
  selectIsAuth,
  selectUser,
  setCredentials,
} from "@/app/store/slices/authSlice";

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);
  const [searchParams] = useSearchParams();
  const [checkingSession, setCheckingSession] = useState(true);

  // Allow through if an OAuth token is present in the URL —
  // the page itself will consume it and set auth state.
  const hasOAuthToken = searchParams.has("token") || searchParams.has("accessToken");

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      if (isAuth || !!user || hasOAuthToken) {
        if (active) setCheckingSession(false);
        return;
      }

      try {
        const refreshRes = await api.post("/auth/refresh", {});
        const freshToken = refreshRes.data?.data?.accessToken || "";

        if (freshToken) {
          localStorage.setItem("accessToken", freshToken);
        }

        const meRes = await api.get("/auth/me");
        const me = meRes.data?.data?.user ?? meRes.data?.data ?? meRes.data;

        dispatch(setCredentials({
          user: me,
          accessToken: freshToken,
        }));
      } catch (_) {
        dispatch(clearAuth());
      } finally {
        if (active) setCheckingSession(false);
      }
    };

    bootstrapSession();
    return () => {
      active = false;
    };
  }, [dispatch, hasOAuthToken, isAuth, user]);

  if (checkingSession) return null;

  if (isAuth || !!user || hasOAuthToken) return children;
  return <Navigate to="/login" replace />;
}
