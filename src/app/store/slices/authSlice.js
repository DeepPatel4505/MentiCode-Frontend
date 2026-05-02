import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// ── Thunks ────────────────────────────────────────────────────

export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? "Login failed");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? "Registration failed");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    // Backend error is non-fatal — we still want to clear the client state.
    // Return a resolved (fulfilled) action so the fulfilled reducer always fires.
    return null;
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/auth/me");
    return res.data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? "Failed to fetch user");
  }
});

export const upgradeUserPlan = createAsyncThunk("auth/upgrade", async (_, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/upgrade");
    return res.data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? "Upgrade failed");
  }
});

// ── Slice ─────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:        null,
    accessToken: null,
    isAuth:      false,
    loading:     false,
    error:       null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user        = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuth      = true;
      if (action.payload.accessToken) {
        localStorage.setItem("accessToken", action.payload.accessToken);
      }
    },
    clearAuth: (state) => {
      state.user        = null;
      state.accessToken = null;
      state.isAuth      = false;
      localStorage.removeItem("accessToken");
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending,   (s) => { s.loading = true; s.error = null; });
    builder.addCase(loginUser.fulfilled, (s, a) => {
      s.loading     = false;
      s.user        = a.payload.user;
      s.accessToken = a.payload.accessToken;
      s.isAuth      = true;
      if (a.payload.accessToken) localStorage.setItem("accessToken", a.payload.accessToken);
    });
    builder.addCase(loginUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // Register
    builder.addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; });
    builder.addCase(registerUser.fulfilled, (s) => { s.loading = false; });
    builder.addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // Logout
    builder.addCase(logoutUser.fulfilled, (s) => {
      s.user = null; s.accessToken = null; s.isAuth = false;
      localStorage.removeItem("accessToken");
    });

    // Fetch me
    builder.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload;
      s.isAuth = true;
      // accessToken may already be in localStorage; keep it in state too
      if (!s.accessToken) {
        const stored = localStorage.getItem("accessToken");
        if (stored) s.accessToken = stored;
      }
    });

    // Upgrade
    builder.addCase(upgradeUserPlan.pending,   (s) => { s.loading = true; });
    builder.addCase(upgradeUserPlan.fulfilled, (s, a) => {
      s.loading = false;
      s.user    = { ...s.user, ...a.payload };
    });
    builder.addCase(upgradeUserPlan.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { setCredentials, clearAuth, updateUser, clearError } = authSlice.actions;

// Selectors
export const selectAuth      = (s) => s.auth;
export const selectUser      = (s) => s.auth.user;
export const selectIsAuth    = (s) => s.auth.isAuth;
export const selectIsAdmin   = (s) => s.auth.user?.role === "admin";
export const selectIsPro     = (s) => s.auth.user?.plan === "pro";
export const selectAuthLoading = (s) => s.auth.loading;
export const selectAuthError   = (s) => s.auth.error;

export default authSlice.reducer;
