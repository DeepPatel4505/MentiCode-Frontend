import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const fetchRoadmaps = createAsyncThunk("roadmap/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/roadmaps", { params });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchRoadmapBySlug = createAsyncThunk("roadmap/fetchBySlug", async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/roadmaps/slug/${slug}`);
    return res.data.data.roadmap;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchRoadmapEnrollment = createAsyncThunk("roadmap/fetchEnrollment", async (roadmapId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/roadmaps/${roadmapId}/enrollment`);
    return res.data.data.enrollment;
  } catch (err) { return rejectWithValue(null); }
});

export const fetchMyRoadmaps = createAsyncThunk("roadmap/fetchMy", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/roadmaps/my");
    return res.data.data.enrollments ?? [];
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const enrollInRoadmap = createAsyncThunk("roadmap/enroll", async ({ roadmapId }, { rejectWithValue, dispatch, getState }) => {
  try {
    const res = await api.post(`/roadmaps/${roadmapId}/enroll`, {});

    // Auto-enroll in all courses in the roadmap (best-effort, ignore 409 already-enrolled)
    const roadmap = getState().roadmap.current;
    const courseIds = (roadmap?.courses ?? []).map((n) => n.course?.id).filter(Boolean);
    await Promise.allSettled(
      courseIds.map((courseId) => api.post(`/courses/${courseId}/enroll`, {}))
    );

    // Refresh myCourses so My Learning page stays in sync
    const { fetchMyCourses } = await import("@/app/store/slices/courseSlice");
    dispatch(fetchMyCourses());
    dispatch(fetchMyRoadmaps());
    return res.data.data.enrollment;
  } catch (err) { return rejectWithValue(err.response?.data?.message ?? "Enrollment failed"); }
});

export const skipTrackNode = createAsyncThunk("roadmap/skipNode", async ({ roadmapId, nodeId }, { rejectWithValue }) => {
  try {
    await api.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/skip`);
    return nodeId;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const roadmapSlice = createSlice({
  name: "roadmap",
  initialState: {
    list:         [],
    pagination:   null,
    current:      null,
    enrollment:   null,
    myRoadmaps:   [],
    loading:      false,
    myLoading:    false,
    enrollLoading: false,
    error:        null,
  },
  reducers: { clearCurrentRoadmap: (s) => { s.current = null; s.enrollment = null; } },
  extraReducers: (b) => {
    b.addCase(fetchRoadmaps.pending,          (s) => { s.loading = true; });
    b.addCase(fetchRoadmaps.fulfilled,        (s, a) => { s.loading = false; s.list = a.payload.roadmaps; s.pagination = a.payload.pagination; });
    b.addCase(fetchRoadmaps.rejected,         (s) => { s.loading = false; });

    b.addCase(fetchRoadmapBySlug.pending,     (s) => { s.loading = true; s.current = null; });
    b.addCase(fetchRoadmapBySlug.fulfilled,   (s, a) => { s.loading = false; s.current = a.payload; });
    b.addCase(fetchRoadmapBySlug.rejected,    (s) => { s.loading = false; });

    b.addCase(fetchRoadmapEnrollment.fulfilled, (s, a) => { s.enrollment = a.payload; });

    b.addCase(fetchMyRoadmaps.pending,        (s) => { s.myLoading = true; });
    b.addCase(fetchMyRoadmaps.fulfilled,      (s, a) => { s.myLoading = false; s.myRoadmaps = a.payload; });
    b.addCase(fetchMyRoadmaps.rejected,       (s) => { s.myLoading = false; });

    b.addCase(enrollInRoadmap.pending,        (s) => { s.enrollLoading = true; s.error = null; });
    b.addCase(enrollInRoadmap.fulfilled,      (s, a) => {
      s.enrollLoading = false;
      s.enrollment = a.payload;
      // myRoadmaps is refreshed via fetchMyRoadmaps dispatch in the thunk
    });
    b.addCase(enrollInRoadmap.rejected,       (s, a) => { s.enrollLoading = false; s.error = a.payload; });
  },
});

export const { clearCurrentRoadmap } = roadmapSlice.actions;
export const selectRoadmaps             = (s) => s.roadmap.list;
export const selectCurrentRoadmap       = (s) => s.roadmap.current;
export const selectRoadmapEnrollment    = (s) => s.roadmap.enrollment;
export const selectMyRoadmaps           = (s) => s.roadmap.myRoadmaps;
export const selectRoadmapLoading       = (s) => s.roadmap.loading;
export const selectMyRoadmapsLoading    = (s) => s.roadmap.myLoading;
export const selectRoadmapEnrollLoading = (s) => s.roadmap.enrollLoading;
export const selectRoadmapError         = (s) => s.roadmap.error;

export default roadmapSlice.reducer;
