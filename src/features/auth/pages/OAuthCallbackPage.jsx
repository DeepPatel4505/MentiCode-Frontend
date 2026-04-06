import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/slices/authSlice";
import api from "@/lib/axios";

/**
 * OAuthCallbackPage
 *
 * After Google/GitHub OAuth, the backend redirects here with both
 * accessToken and refreshToken already set as httpOnly cookies.
 *
 * Strategy:
 *  1. If a token is in the URL query → use it (legacy/fallback path)
 *  2. Otherwise → call /auth/me directly; the browser sends the
 *     accessToken cookie automatically (withCredentials: true).
 *     Then call /auth/refresh once to get the accessToken value
 *     for localStorage (needed by the axios Bearer interceptor).
 *     We do refresh AFTER me succeeds to avoid a redundant token
 *     generation if me fails.
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = searchParams.get("token") || searchParams.get("accessToken");
    if (token) {
      fetchUserWithToken(token);
    } else {
      fetchUserViaCookies();
    }
  }, []);

  // ── Path A: token arrived in the URL ───────────────────────
  const fetchUserWithToken = (token) => {
    localStorage.setItem("accessToken", token);
    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = res.data?.data?.user ?? res.data?.data ?? res.data;
        dispatch(setCredentials({ user, accessToken: token }));
        navigate(user?.role === "admin" ? "/admin" : "/courses", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
      });
  };

  // ── Path B: cookies were set by the backend redirect ───────
  const fetchUserViaCookies = async () => {
    try {
      // The accessToken cookie is sent automatically — no Bearer header needed yet.
      const meRes = await api.get("/auth/me");
      const user = meRes.data?.data?.user ?? meRes.data?.data ?? meRes.data;

      // Now get a token string for localStorage / future Bearer headers.
      // Use the refreshToken cookie to mint a fresh accessToken.
      let accessToken = null;
      try {
        const refreshRes = await api.post("/auth/refresh", {});
        accessToken =
          refreshRes.data?.data?.accessToken ??
          refreshRes.data?.accessToken ??
          null;
      } catch (_) {
        // Refresh failed — still proceed; the cookie will keep API calls alive
        // until the access token cookie itself expires.
      }

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }

      dispatch(setCredentials({ user, accessToken: accessToken ?? "" }));
      navigate(user?.role === "admin" ? "/admin" : "/courses", { replace: true });
    } catch (err) {
      console.error("OAuth callback failed:", err?.response?.data ?? err.message);
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(240_10%_4%)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm text-neutral-500">Signing you in…</p>
      </div>
    </div>
  );
}