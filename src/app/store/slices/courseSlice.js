import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const fetchCourses = createAsyncThunk("courses/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/courses", { params });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCourseBySlug = createAsyncThunk("courses/fetchBySlug", async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/courses/slug/${slug}`);
    return res.data.data.course;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// GET /enrollments/my — single query, returns all enrolled courses with progress.
export const fetchMyCourses = createAsyncThunk("courses/fetchMy", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/enrollments/my");
    return res.data.data.courses ?? [];
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchLesson = createAsyncThunk("courses/fetchLesson", async (lessonId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/lessons/${lessonId}`);
    return res.data.data.lesson;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchLevel = createAsyncThunk("courses/fetchLevel", async (levelId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/levels/${levelId}`);
    return res.data.data.level;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    list:          [],
    pagination:    null,
    current:       null,
    myCourses:     [],
    currentLesson: null,
    currentLevel:  null,
    loading:       false,
    myLoading:     false,
    lessonLoading: false,
    levelLoading:  false,
    error:         null,
  },
  reducers: {
    clearCurrentCourse: (s) => { s.current = null; },
    clearCurrentLesson: (s) => { s.currentLesson = null; },
    clearCurrentLevel:  (s) => { s.currentLevel  = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCourses.pending,       (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchCourses.fulfilled,     (s, a) => { s.loading = false; s.list = a.payload.courses; s.pagination = a.payload.pagination; });
    b.addCase(fetchCourses.rejected,      (s, a) => { s.loading = false; s.error = a.payload; });

    b.addCase(fetchCourseBySlug.pending,  (s) => { s.loading = true; s.current = null; });
    b.addCase(fetchCourseBySlug.fulfilled,(s, a) => { s.loading = false; s.current = a.payload; });
    b.addCase(fetchCourseBySlug.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    b.addCase(fetchMyCourses.pending,     (s) => { s.myLoading = true; });
    b.addCase(fetchMyCourses.fulfilled,   (s, a) => { s.myLoading = false; s.myCourses = a.payload; });
    b.addCase(fetchMyCourses.rejected,    (s) => { s.myLoading = false; });

    b.addCase(fetchLesson.pending,        (s) => { s.lessonLoading = true; });
    b.addCase(fetchLesson.fulfilled,      (s, a) => { s.lessonLoading = false; s.currentLesson = a.payload; });
    b.addCase(fetchLesson.rejected,       (s) => { s.lessonLoading = false; });

    b.addCase(fetchLevel.pending,         (s) => { s.levelLoading = true; });
    b.addCase(fetchLevel.fulfilled,       (s, a) => { s.levelLoading = false; s.currentLevel = a.payload; });
    b.addCase(fetchLevel.rejected,        (s) => { s.levelLoading = false; });
  },
});

export const { clearCurrentCourse, clearCurrentLesson, clearCurrentLevel } = courseSlice.actions;

export const selectCourses        = (s) => s.courses.list;
export const selectPagination     = (s) => s.courses.pagination;
export const selectCurrentCourse  = (s) => s.courses.current;
export const selectMyCourses      = (s) => s.courses.myCourses;
export const selectCurrentLesson  = (s) => s.courses.currentLesson;
export const selectCurrentLevel   = (s) => s.courses.currentLevel;
export const selectCoursesLoading = (s) => s.courses.loading;
export const selectMyCoursesLoading = (s) => s.courses.myLoading;
export const selectLessonLoading  = (s) => s.courses.lessonLoading;
export const selectLevelLoading   = (s) => s.courses.levelLoading;

export default courseSlice.reducer;
