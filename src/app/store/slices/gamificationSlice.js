import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// ── Thunks ────────────────────────────────────────────────────

export const fetchStreak = createAsyncThunk("gamification/fetchStreak", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/streak");
    const d   = res.data.data;
    const xpTotal = d.xpTotal ?? 0;
    const level   = getLevelFromXp(xpTotal).level;
    return {
      currentStreak:   d.currentStreak   ?? 0,
      longestStreak:   d.longestStreak   ?? 0,
      lastActivityAt:  d.lastActivityAt  ?? null,
      totalActiveDays: d.totalActiveDays ?? 0,
      calendar:        d.calendar        ?? {},
      xpTotal,
      level,
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? "Failed to fetch streak");
  }
});

export const fetchLeaderboard = createAsyncThunk("gamification/leaderboard", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/leaderboard");
    return res.data.data.leaderboard ?? [];
  } catch (_) {
    return [];
  }
});

export const saveOnboarding = createAsyncThunk("gamification/saveOnboarding", async (data, { rejectWithValue }) => {
  try {
    // Store onboarding data — endpoint can be added to user-service later
    // For now just returns the data to persist in Redux
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// ── XP levels config ──────────────────────────────────────────
export const XP_LEVELS = [
  { level: 1,  xpNeeded: 0    },
  { level: 2,  xpNeeded: 100  },
  { level: 3,  xpNeeded: 250  },
  { level: 4,  xpNeeded: 500  },
  { level: 5,  xpNeeded: 900  },
  { level: 6,  xpNeeded: 1400 },
  { level: 7,  xpNeeded: 2000 },
  { level: 8,  xpNeeded: 2800 },
  { level: 9,  xpNeeded: 3800 },
  { level: 10, xpNeeded: 5000 },
];

export const getLevelFromXp = (xp) => {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.xpNeeded) current = lvl;
    else break;
  }
  return current;
};

export const getNextLevel = (currentLevel) =>
  XP_LEVELS.find((l) => l.level === currentLevel + 1) ?? null;

export const getXpProgress = (xp) => {
  const current = getLevelFromXp(xp);
  const next    = getNextLevel(current.level);
  if (!next) return { pct: 100, current, next: null, xpInLevel: 0, xpNeeded: 0 };
  const xpInLevel = xp - current.xpNeeded;
  const xpNeeded  = next.xpNeeded - current.xpNeeded;
  return { pct: Math.round((xpInLevel / xpNeeded) * 100), current, next, xpInLevel, xpNeeded };
};

// ── Slice ─────────────────────────────────────────────────────
const gamificationSlice = createSlice({
  name: "gamification",
  initialState: {
    streak:        0,
    longestStreak: 0,
    lastActivityAt: null,
    totalActiveDays: 0,
    calendar:      {},
    xpTotal:       0,
    level:         1,
    leaderboard:   [],
    onboarding: {
      completed: false,
      step:      0,
      skillLevel:  null,   // "beginner" | "intermediate" | "advanced"
      goal:        null,   // "job" | "projects" | "fun"
      heardFrom:   null,   // "google" | "friend" | "social" | "other"
      topics:      [],     // selected roadmap/topic IDs
      dailyGoal:   null,   // 5 | 15 | 30
    },
    showLevelUp:   false,
    newLevel:      null,
    streakLoading: false,
    streakError:   null,
    loading:       false,
  },
  reducers: {
    setOnboardingStep:  (s, a) => { s.onboarding.step = a.payload; },
    setOnboardingField: (s, a) => { s.onboarding = { ...s.onboarding, ...a.payload }; },
    completeOnboarding: (s)    => { s.onboarding.completed = true; },
    triggerLevelUp:     (s, a) => { s.showLevelUp = true; s.newLevel = a.payload; },
    dismissLevelUp:     (s)    => { s.showLevelUp = false; s.newLevel = null; },
    addXp: (s, a) => {
      // Called after a level attempt succeeds — check if leveled up
      const oldLevel = getLevelFromXp(s.xpTotal).level;
      const newXp    = s.xpTotal + a.payload;
      const newLevel = getLevelFromXp(newXp).level;
      s.xpTotal = newXp;
      s.level   = newLevel;
      if (newLevel > oldLevel) {
        s.showLevelUp = true;
        s.newLevel    = newLevel;
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchStreak.pending,    (s)    => { s.streakLoading = true; s.streakError = null; });
    b.addCase(fetchStreak.rejected,   (s, a) => { s.streakLoading = false; s.streakError = a.payload ?? null; });
    b.addCase(fetchStreak.fulfilled,  (s, a) => {
      s.streakLoading  = false;
      s.streakError    = null;
      s.streak         = a.payload.currentStreak;
      s.longestStreak  = a.payload.longestStreak;
      s.lastActivityAt = a.payload.lastActivityAt;
      s.totalActiveDays = a.payload.totalActiveDays ?? 0;
      s.calendar       = a.payload.calendar ?? {};
      s.xpTotal        = a.payload.xpTotal;
      s.level          = a.payload.level;
    });
    b.addCase(fetchLeaderboard.pending,   (s) => { s.loading = true; });
    b.addCase(fetchLeaderboard.fulfilled, (s, a) => { s.loading = false; s.leaderboard = a.payload; });
    b.addCase(fetchLeaderboard.rejected,  (s) => { s.loading = false; });
    b.addCase(saveOnboarding.fulfilled,   (s, a) => {
      s.onboarding = { ...s.onboarding, ...a.payload, completed: true };
    });
  },
});

export const {
  setOnboardingStep, setOnboardingField, completeOnboarding,
  triggerLevelUp, dismissLevelUp, addXp,
} = gamificationSlice.actions;

export const selectStreak          = (s) => s.gamification.streak;
export const selectLongestStreak   = (s) => s.gamification.longestStreak;
export const selectTotalActiveDays = (s) => s.gamification.totalActiveDays;
export const selectCalendar        = (s) => s.gamification.calendar;
export const selectXpTotal         = (s) => s.gamification.xpTotal;
export const selectGamificationLevel = (s) => s.gamification.level;
export const selectLeaderboard     = (s) => s.gamification.leaderboard;
export const selectOnboarding      = (s) => s.gamification.onboarding;
export const selectShowLevelUp     = (s) => s.gamification.showLevelUp;
export const selectNewLevel        = (s) => s.gamification.newLevel;
export const selectStreakLoading   = (s) => s.gamification.streakLoading;
export const selectStreakError     = (s) => s.gamification.streakError;

export default gamificationSlice.reducer;
