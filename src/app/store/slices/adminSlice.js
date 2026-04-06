import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const fetchAdminStats = createAsyncThunk("admin/stats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/courses", { params: { limit: 50 } });
    const courses = res.data.data.courses ?? [];
    const totalEnrollments = courses.reduce((a, c) => a + (c._count?.enrollments ?? 0), 0);
    const totalReviews     = courses.reduce((a, c) => a + (c._count?.reviews     ?? 0), 0);
    return {
      totalCourses:     courses.length,
      totalEnrollments,
      totalReviews,
      publishedCourses: courses.filter((c) => c.status === "published").length,
      draftCourses:     courses.filter((c) => c.status === "draft").length,
      courses,
    };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAdminCourses = createAsyncThunk("admin/courses", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/courses", { params: { ...params, limit: 50 } });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createCourse = createAsyncThunk("admin/createCourse", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/courses", data);
    return res.data.data.course;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCourse = createAsyncThunk("admin/updateCourse", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/courses/${id}`, data);
    return res.data.data.course;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteCourse = createAsyncThunk("admin/deleteCourse", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/courses/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const publishCourse = createAsyncThunk("admin/publishCourse", async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/courses/${id}/publish`);
    return res.data.data.course;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createSection = createAsyncThunk("admin/createSection", async ({ courseId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/courses/${courseId}/sections`, data);
    return res.data.data.section;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createLesson = createAsyncThunk("admin/createLesson", async ({ sectionId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/sections/${sectionId}/lessons`, data);
    return res.data.data.lesson;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createGameLevel = createAsyncThunk("admin/createLevel", async ({ sectionId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/sections/${sectionId}/levels`, data);
    return res.data.data.level;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// ── Roadmap admin thunks ──────────────────────────────────────

export const fetchAdminRoadmaps = createAsyncThunk("admin/roadmaps", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/roadmaps", { params: { limit: 50 } });
    return res.data.data.roadmaps ?? [];
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createRoadmap = createAsyncThunk("admin/createRoadmap", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/roadmaps", data);
    return res.data.data.roadmap;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateRoadmap = createAsyncThunk("admin/updateRoadmap", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/roadmaps/${id}`, data);
    return res.data.data.roadmap;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteRoadmap = createAsyncThunk("admin/deleteRoadmap", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/roadmaps/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addCourseToRoadmap = createAsyncThunk("admin/addCourseToRoadmap", async ({ roadmapId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/roadmaps/${roadmapId}/courses`, data);
    return res.data.data.node;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeCourseFromRoadmap = createAsyncThunk("admin/removeCourseFromRoadmap", async ({ roadmapId, nodeId }, { rejectWithValue }) => {
  try {
    await api.delete(`/roadmaps/${roadmapId}/courses/${nodeId}`);
    return nodeId;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats:           null,
    courses:         [],
    roadmaps:        [],
    pagination:      null,
    editingCourse:   null,
    loading:         false,
    roadmapsLoading: false,
    saving:          false,
    error:           null,
  },
  reducers: {
    setEditingCourse: (s, a) => { s.editingCourse = a.payload; },
    clearError:       (s)    => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchAdminStats.pending,    (s) => { s.loading = true; });
    b.addCase(fetchAdminStats.fulfilled,  (s, a) => { s.loading = false; s.stats = a.payload; s.courses = a.payload.courses; });
    b.addCase(fetchAdminStats.rejected,   (s) => { s.loading = false; });

    b.addCase(fetchAdminCourses.fulfilled,(s, a) => { s.courses = a.payload.courses; s.pagination = a.payload.pagination; });

    b.addCase(createCourse.pending,       (s) => { s.saving = true; s.error = null; });
    b.addCase(createCourse.fulfilled,     (s, a) => { s.saving = false; s.courses.unshift(a.payload); });
    b.addCase(createCourse.rejected,      (s, a) => { s.saving = false; s.error = a.payload; });

    b.addCase(updateCourse.pending,       (s) => { s.saving = true; s.error = null; });
    b.addCase(updateCourse.fulfilled,     (s, a) => {
      s.saving = false;
      const idx = s.courses.findIndex((c) => c.id === a.payload.id);
      if (idx >= 0) s.courses[idx] = a.payload;
    });
    b.addCase(updateCourse.rejected,      (s, a) => { s.saving = false; s.error = a.payload; });

    b.addCase(deleteCourse.fulfilled,     (s, a) => { s.courses = s.courses.filter((c) => c.id !== a.payload); });
    b.addCase(publishCourse.fulfilled,    (s, a) => {
      const idx = s.courses.findIndex((c) => c.id === a.payload.id);
      if (idx >= 0) s.courses[idx] = a.payload;
    });

    // Roadmaps
    b.addCase(fetchAdminRoadmaps.pending,   (s) => { s.roadmapsLoading = true; });
    b.addCase(fetchAdminRoadmaps.fulfilled, (s, a) => { s.roadmapsLoading = false; s.roadmaps = a.payload; });
    b.addCase(fetchAdminRoadmaps.rejected,  (s) => { s.roadmapsLoading = false; });

    b.addCase(createRoadmap.pending,  (s) => { s.saving = true; s.error = null; });
    b.addCase(createRoadmap.fulfilled,(s, a) => { s.saving = false; s.roadmaps.unshift(a.payload); });
    b.addCase(createRoadmap.rejected, (s, a) => { s.saving = false; s.error = a.payload; });

    b.addCase(updateRoadmap.pending,  (s) => { s.saving = true; s.error = null; });
    b.addCase(updateRoadmap.fulfilled,(s, a) => {
      s.saving = false;
      const idx = s.roadmaps.findIndex((r) => r.id === a.payload.id);
      if (idx >= 0) s.roadmaps[idx] = a.payload;
    });
    b.addCase(updateRoadmap.rejected, (s, a) => { s.saving = false; s.error = a.payload; });

    b.addCase(deleteRoadmap.fulfilled,(s, a) => { s.roadmaps = s.roadmaps.filter((r) => r.id !== a.payload); });
  },
});

export const { setEditingCourse, clearError } = adminSlice.actions;
export const selectAdminStats           = (s) => s.admin.stats;
export const selectAdminCourses         = (s) => s.admin.courses;
export const selectAdminRoadmaps        = (s) => s.admin.roadmaps;
export const selectAdminLoading         = (s) => s.admin.loading;
export const selectAdminRoadmapsLoading = (s) => s.admin.roadmapsLoading;
export const selectAdminSaving          = (s) => s.admin.saving;
export const selectAdminError           = (s) => s.admin.error;
export const selectEditingCourse        = (s) => s.admin.editingCourse;
export default adminSlice.reducer;
