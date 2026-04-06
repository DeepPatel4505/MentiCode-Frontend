import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { fetchMyCourses } from "@/app/store/slices/courseSlice";

export const fetchEnrollment = createAsyncThunk("enroll/fetch", async (courseId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/courses/${courseId}/enrollment`);
    return res.data.data.enrollment;
  } catch (err) { return rejectWithValue(null); }
});

export const fetchCourseProgress = createAsyncThunk("enroll/progress", async (courseId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/courses/${courseId}/progress`);
    return res.data.data.enrollment;
  } catch (err) { return rejectWithValue(null); }
});

export const enrollInCourse = createAsyncThunk("enroll/enroll", async (courseId, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.post(`/courses/${courseId}/enroll`, {});
    // Refresh myCourses so MyLearningPage and Dashboard stay in sync
    dispatch(fetchMyCourses());
    return res.data.data.enrollment;
  } catch (err) { return rejectWithValue(err.response?.data?.message ?? "Enrollment failed"); }
});

export const updateLessonProgress = createAsyncThunk("enroll/lessonProgress", async ({ lessonId, ...data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/lessons/${lessonId}/progress`, data);
    return res.data.data.progress;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const submitLevelAttempt = createAsyncThunk("enroll/levelAttempt", async ({ levelId, answers }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/levels/${levelId}/attempt`, { answers });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const skipSection = createAsyncThunk("enroll/skipSection", async ({ courseId, sectionId }, { rejectWithValue }) => {
  try {
    await api.post(`/courses/${courseId}/sections/skip`, { sectionId });
    return sectionId;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const enrollSlice = createSlice({
  name: "enroll",
  initialState: {
    enrollment:        null,
    progress:          null,
    lastAttemptResult: null,
    loading:           false,
    enrollLoading:     false,
    attemptLoading:    false,
    error:             null,
  },
  reducers: {
    clearEnrollment:    (s) => { s.enrollment = null; s.progress = null; },
    clearAttemptResult: (s) => { s.lastAttemptResult = null; },
    clearError:         (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchEnrollment.pending,   (s) => { s.loading = true; });
    b.addCase(fetchEnrollment.fulfilled, (s, a) => {
      s.loading = false;
      s.enrollment = a.payload;
    });
    b.addCase(fetchEnrollment.rejected,  (s) => { s.loading = false; s.enrollment = null; });

    b.addCase(fetchCourseProgress.fulfilled, (s, a) => { s.progress = a.payload; });

    b.addCase(enrollInCourse.pending,    (s) => { s.enrollLoading = true; s.error = null; });
    b.addCase(enrollInCourse.fulfilled,  (s, a) => {
      s.enrollLoading = false;
      s.enrollment = a.payload;
    });
    b.addCase(enrollInCourse.rejected,   (s, a) => { s.enrollLoading = false; s.error = a.payload; });

    b.addCase(updateLessonProgress.fulfilled, (s, a) => {
      // Update progress in place if we have it
      if (s.progress?.lessonProgress) {
        const idx = s.progress.lessonProgress.findIndex((lp) => lp.lessonId === a.meta.arg.lessonId);
        if (idx >= 0) s.progress.lessonProgress[idx] = { ...s.progress.lessonProgress[idx], ...a.payload };
      }
    });

    b.addCase(submitLevelAttempt.pending,   (s) => { s.attemptLoading = true; s.lastAttemptResult = null; });
    b.addCase(submitLevelAttempt.fulfilled, (s, a) => { s.attemptLoading = false; s.lastAttemptResult = a.payload; });
    b.addCase(submitLevelAttempt.rejected,  (s, a) => { s.attemptLoading = false; s.error = a.payload?.message; });
  },
});

export const { clearEnrollment, clearAttemptResult, clearError } = enrollSlice.actions;

export const selectEnrollment        = (s) => s.enroll.enrollment;
export const selectCourseProgress    = (s) => s.enroll.progress;
export const selectLastAttemptResult = (s) => s.enroll.lastAttemptResult;
export const selectEnrollLoading     = (s) => s.enroll.enrollLoading;
export const selectAttemptLoading    = (s) => s.enroll.attemptLoading;
export const selectEnrollError       = (s) => s.enroll.error;

export default enrollSlice.reducer;
