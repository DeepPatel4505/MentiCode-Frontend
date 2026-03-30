import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

const CourseContext = createContext(null);

const XP_LEVELS = [
  { level: 1, xpNeeded: 0 },
  { level: 2, xpNeeded: 100 },
  { level: 3, xpNeeded: 250 },
  { level: 4, xpNeeded: 500 },
  { level: 5, xpNeeded: 900 },
  { level: 6, xpNeeded: 1400 },
  { level: 7, xpNeeded: 2000 },
  { level: 8, xpNeeded: 2800 },
  { level: 9, xpNeeded: 3800 },
  { level: 10, xpNeeded: 5000 },
];

export const getLevelFromXp = (xp) => {
  let current = XP_LEVELS[0];
  for (const level of XP_LEVELS) {
    if (xp >= level.xpNeeded) current = level;
    else break;
  }
  return current;
};

export const getNextLevel = (currentLevel) =>
  XP_LEVELS.find((item) => item.level === currentLevel + 1) ?? null;

export const getXpProgress = (xp) => {
  const current = getLevelFromXp(xp);
  const next = getNextLevel(current.level);
  if (!next) return { pct: 100, current, next: null, xpInLevel: 0, xpNeeded: 0 };

  const xpInLevel = xp - current.xpNeeded;
  const xpNeeded = next.xpNeeded - current.xpNeeded;
  return {
    pct: Math.round((xpInLevel / xpNeeded) * 100),
    current,
    next,
    xpInLevel,
    xpNeeded,
  };
};

const fulfilled = (payload) => ({ meta: { requestStatus: "fulfilled" }, payload });
const rejected = (payload) => ({ meta: { requestStatus: "rejected" }, payload });

const getInitialOnboarding = () => {
  try {
    const raw = localStorage.getItem("mc_onboarding");
    if (!raw) {
      return {
        completed: false,
        step: 0,
        skillLevel: null,
        goal: null,
        heardFrom: null,
        topics: [],
        dailyGoal: null,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      completed: false,
      step: 0,
      skillLevel: null,
      goal: null,
      heardFrom: null,
      topics: [],
      dailyGoal: null,
    };
  }
};

export function CourseProvider({ children }) {
  const [coursesState, setCoursesState] = useState({
    list: [],
    pagination: null,
    current: null,
    myCourses: [],
    currentLesson: null,
    currentLevel: null,
    loading: false,
    myLoading: false,
    lessonLoading: false,
    levelLoading: false,
    error: null,
  });

  const [enrollState, setEnrollState] = useState({
    enrollment: null,
    progress: null,
    lastAttemptResult: null,
    loading: false,
    enrollLoading: false,
    attemptLoading: false,
    error: null,
  });

  const [roadmapState, setRoadmapState] = useState({
    list: [],
    pagination: null,
    current: null,
    enrollment: null,
    myRoadmaps: [],
    loading: false,
    myLoading: false,
    enrollLoading: false,
    error: null,
  });

  const [adminState, setAdminState] = useState({
    stats: null,
    courses: [],
    roadmaps: [],
    pagination: null,
    editingCourse: null,
    loading: false,
    roadmapsLoading: false,
    saving: false,
    error: null,
  });

  const [gamificationState, setGamificationState] = useState({
    streak: 0,
    longestStreak: 0,
    lastActivityAt: null,
    totalActiveDays: 0,
    calendar: {},
    xpTotal: 0,
    level: 1,
    leaderboard: [],
    onboarding: getInitialOnboarding(),
    showLevelUp: false,
    newLevel: null,
    streakLoading: false,
    streakError: null,
    loading: false,
  });

  useEffect(() => {
    localStorage.setItem("mc_onboarding", JSON.stringify(gamificationState.onboarding));
  }, [gamificationState.onboarding]);

  const fetchCourses = useCallback(async (params) => {
    setCoursesState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get("/courses", { params });
      const payload = res.data.data;
      setCoursesState((prev) => ({
        ...prev,
        loading: false,
        list: payload.courses ?? [],
        pagination: payload.pagination ?? null,
      }));
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to fetch courses";
      setCoursesState((prev) => ({ ...prev, loading: false, error: message }));
      return rejected(message);
    }
  }, []);

  const fetchCourseBySlug = useCallback(async (slug) => {
    setCoursesState((prev) => ({ ...prev, loading: true, current: null }));
    try {
      const res = await api.get(`/courses/slug/${slug}`);
      const payload = res.data.data.course;
      setCoursesState((prev) => ({ ...prev, loading: false, current: payload }));
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to load course";
      setCoursesState((prev) => ({ ...prev, loading: false, error: message }));
      return rejected(message);
    }
  }, []);

  const fetchMyCourses = useCallback(async () => {
    setCoursesState((prev) => ({ ...prev, myLoading: true }));
    try {
      const res = await api.get("/enrollments/my");
      const payload = res.data.data.courses ?? [];
      setCoursesState((prev) => ({ ...prev, myLoading: false, myCourses: payload }));
      return fulfilled(payload);
    } catch (error) {
      setCoursesState((prev) => ({ ...prev, myLoading: false }));
      return rejected(error?.message ?? "Failed to fetch learning list");
    }
  }, []);

  const fetchLesson = useCallback(async (lessonId) => {
    setCoursesState((prev) => ({ ...prev, lessonLoading: true }));
    try {
      const res = await api.get(`/lessons/${lessonId}`);
      const payload = res.data.data.lesson;
      setCoursesState((prev) => ({ ...prev, lessonLoading: false, currentLesson: payload }));
      return fulfilled(payload);
    } catch (error) {
      setCoursesState((prev) => ({ ...prev, lessonLoading: false }));
      return rejected(error?.message ?? "Failed to fetch lesson");
    }
  }, []);

  const fetchLevel = useCallback(async (levelId) => {
    setCoursesState((prev) => ({ ...prev, levelLoading: true }));
    try {
      const res = await api.get(`/levels/${levelId}`);
      const payload = res.data.data.level;
      setCoursesState((prev) => ({ ...prev, levelLoading: false, currentLevel: payload }));
      return fulfilled(payload);
    } catch (error) {
      setCoursesState((prev) => ({ ...prev, levelLoading: false }));
      return rejected(error?.message ?? "Failed to fetch level");
    }
  }, []);

  const fetchEnrollment = useCallback(async (courseId) => {
    setEnrollState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.get(`/courses/${courseId}/enrollment`);
      const payload = res.data.data.enrollment;
      setEnrollState((prev) => ({ ...prev, loading: false, enrollment: payload }));
      return fulfilled(payload);
    } catch {
      setEnrollState((prev) => ({ ...prev, loading: false, enrollment: null }));
      return rejected(null);
    }
  }, []);

  const fetchCourseProgress = useCallback(async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}/progress`);
      const payload = res.data.data.enrollment;
      setEnrollState((prev) => ({ ...prev, progress: payload }));
      return fulfilled(payload);
    } catch {
      return rejected(null);
    }
  }, []);

  const enrollInCourse = useCallback(async (courseId) => {
    setEnrollState((prev) => ({ ...prev, enrollLoading: true, error: null }));
    try {
      const res = await api.post(`/courses/${courseId}/enroll`, {});
      const payload = res.data.data.enrollment;
      setEnrollState((prev) => ({ ...prev, enrollLoading: false, enrollment: payload }));
      await fetchMyCourses();
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Enrollment failed";
      setEnrollState((prev) => ({ ...prev, enrollLoading: false, error: message }));
      return rejected(message);
    }
  }, [fetchMyCourses]);

  const updateLessonProgress = useCallback(async ({ lessonId, ...data }) => {
    try {
      const res = await api.patch(`/lessons/${lessonId}/progress`, data);
      const payload = res.data.data.progress;
      setEnrollState((prev) => {
        if (!prev.progress?.lessonProgress) return prev;
        const idx = prev.progress.lessonProgress.findIndex((lp) => lp.lessonId === lessonId);
        if (idx < 0) return prev;

        const nextLessonProgress = [...prev.progress.lessonProgress];
        nextLessonProgress[idx] = { ...nextLessonProgress[idx], ...payload };

        return {
          ...prev,
          progress: {
            ...prev.progress,
            lessonProgress: nextLessonProgress,
          },
        };
      });
      return fulfilled(payload);
    } catch (error) {
      return rejected(error?.message ?? "Failed to update progress");
    }
  }, []);

  const submitLevelAttempt = useCallback(async ({ levelId, answers }) => {
    setEnrollState((prev) => ({ ...prev, attemptLoading: true, lastAttemptResult: null }));
    try {
      const res = await api.post(`/levels/${levelId}/attempt`, { answers });
      const payload = res.data.data;
      setEnrollState((prev) => ({ ...prev, attemptLoading: false, lastAttemptResult: payload }));
      return fulfilled(payload);
    } catch (error) {
      const payload = error ?? { message: "Attempt failed" };
      setEnrollState((prev) => ({ ...prev, attemptLoading: false, error: payload?.message ?? null }));
      return rejected(payload);
    }
  }, []);

  const skipSection = useCallback(async ({ courseId, sectionId }) => {
    try {
      await api.post(`/courses/${courseId}/sections/skip`, { sectionId });
      return fulfilled(sectionId);
    } catch (error) {
      return rejected(error?.message ?? "Failed to skip section");
    }
  }, []);

  const fetchRoadmaps = useCallback(async (params) => {
    setRoadmapState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.get("/roadmaps", { params });
      const payload = res.data.data;
      setRoadmapState((prev) => ({
        ...prev,
        loading: false,
        list: payload?.roadmaps ?? [],
        pagination: payload?.pagination ?? null,
      }));
      return fulfilled(payload);
    } catch {
      setRoadmapState((prev) => ({ ...prev, loading: false }));
      return rejected("Failed to fetch roadmaps");
    }
  }, []);

  const fetchRoadmapBySlug = useCallback(async (slug) => {
    setRoadmapState((prev) => ({ ...prev, loading: true, current: null }));
    try {
      const res = await api.get(`/roadmaps/slug/${slug}`);
      const payload = res.data.data.roadmap;
      setRoadmapState((prev) => ({ ...prev, loading: false, current: payload }));
      return fulfilled(payload);
    } catch {
      setRoadmapState((prev) => ({ ...prev, loading: false }));
      return rejected("Failed to load roadmap");
    }
  }, []);

  const fetchRoadmapEnrollment = useCallback(async (roadmapId) => {
    try {
      const res = await api.get(`/roadmaps/${roadmapId}/enrollment`);
      const payload = res.data.data.enrollment;
      setRoadmapState((prev) => ({ ...prev, enrollment: payload }));
      return fulfilled(payload);
    } catch {
      return rejected(null);
    }
  }, []);

  const fetchMyRoadmaps = useCallback(async () => {
    setRoadmapState((prev) => ({ ...prev, myLoading: true }));
    try {
      const res = await api.get("/roadmaps/my");
      const payload = res.data.data.enrollments ?? [];
      setRoadmapState((prev) => ({ ...prev, myLoading: false, myRoadmaps: payload }));
      return fulfilled(payload);
    } catch (error) {
      setRoadmapState((prev) => ({ ...prev, myLoading: false }));
      return rejected(error?.message ?? "Failed to fetch my roadmaps");
    }
  }, []);

  const enrollInRoadmap = useCallback(async ({ roadmapId }) => {
    setRoadmapState((prev) => ({ ...prev, enrollLoading: true, error: null }));
    try {
      const res = await api.post(`/roadmaps/${roadmapId}/enroll`, {});
      const payload = res.data.data.enrollment;

      const roadmap = roadmapState.current;
      const courseIds = (roadmap?.courses ?? []).map((node) => node.course?.id).filter(Boolean);
      await Promise.allSettled(courseIds.map((courseId) => api.post(`/courses/${courseId}/enroll`, {})));

      setRoadmapState((prev) => ({ ...prev, enrollLoading: false, enrollment: payload }));
      await Promise.all([fetchMyCourses(), fetchMyRoadmaps()]);
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Enrollment failed";
      setRoadmapState((prev) => ({ ...prev, enrollLoading: false, error: message }));
      return rejected(message);
    }
  }, [fetchMyCourses, fetchMyRoadmaps, roadmapState.current]);

  const skipTrackNode = useCallback(async ({ roadmapId, nodeId }) => {
    try {
      await api.patch(`/roadmaps/${roadmapId}/nodes/${nodeId}/skip`);
      return fulfilled(nodeId);
    } catch (error) {
      return rejected(error?.message ?? "Failed to skip node");
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    setGamificationState((prev) => ({ ...prev, streakLoading: true, streakError: null }));
    try {
      const res = await api.get("/streak");
      const data = res.data.data;
      const xpTotal = data.xpTotal ?? 0;
      const level = getLevelFromXp(xpTotal).level;

      const payload = {
        streak: data.currentStreak ?? 0,
        longestStreak: data.longestStreak ?? 0,
        lastActivityAt: data.lastActivityAt ?? null,
        totalActiveDays: data.totalActiveDays ?? 0,
        calendar: data.calendar ?? {},
        xpTotal,
        level,
      };

      setGamificationState((prev) => ({
        ...prev,
        streakLoading: false,
        streakError: null,
        ...payload,
      }));

      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to fetch streak";
      setGamificationState((prev) => ({ ...prev, streakLoading: false, streakError: message }));
      return rejected(message);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setGamificationState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.get("/leaderboard");
      const payload = res.data.data.leaderboard ?? [];
      setGamificationState((prev) => ({ ...prev, loading: false, leaderboard: payload }));
      return fulfilled(payload);
    } catch {
      setGamificationState((prev) => ({ ...prev, loading: false, leaderboard: [] }));
      return fulfilled([]);
    }
  }, []);

  const setOnboardingField = useCallback((data) => {
    setGamificationState((prev) => ({
      ...prev,
      onboarding: { ...prev.onboarding, ...data },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setGamificationState((prev) => ({
      ...prev,
      onboarding: { ...prev.onboarding, completed: true },
    }));
  }, []);

  const addXp = useCallback((xp) => {
    setGamificationState((prev) => {
      const oldLevel = getLevelFromXp(prev.xpTotal).level;
      const newXp = prev.xpTotal + xp;
      const newLevel = getLevelFromXp(newXp).level;
      return {
        ...prev,
        xpTotal: newXp,
        level: newLevel,
        showLevelUp: newLevel > oldLevel,
        newLevel: newLevel > oldLevel ? newLevel : prev.newLevel,
      };
    });
  }, []);

  const dismissLevelUp = useCallback(() => {
    setGamificationState((prev) => ({ ...prev, showLevelUp: false, newLevel: null }));
  }, []);

  const clearAttemptResult = useCallback(() => {
    setEnrollState((prev) => ({ ...prev, lastAttemptResult: null }));
  }, []);

  const fetchAdminStats = useCallback(async () => {
    setAdminState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.get("/courses", { params: { limit: 50 } });
      const courses = res.data.data.courses ?? [];
      const payload = {
        totalCourses: courses.length,
        totalEnrollments: courses.reduce((acc, course) => acc + (course._count?.enrollments ?? 0), 0),
        totalReviews: courses.reduce((acc, course) => acc + (course._count?.reviews ?? 0), 0),
        publishedCourses: courses.filter((course) => course.status === "published").length,
        draftCourses: courses.filter((course) => course.status === "draft").length,
        courses,
      };
      setAdminState((prev) => ({ ...prev, loading: false, stats: payload, courses: payload.courses }));
      return fulfilled(payload);
    } catch (error) {
      setAdminState((prev) => ({ ...prev, loading: false }));
      return rejected(error?.message ?? "Failed to fetch admin stats");
    }
  }, []);

  const fetchAdminCourses = useCallback(async (params) => {
    try {
      const res = await api.get("/courses", { params: { ...params, limit: 50 } });
      const payload = res.data.data;
      setAdminState((prev) => ({
        ...prev,
        courses: payload.courses ?? [],
        pagination: payload.pagination ?? null,
      }));
      return fulfilled(payload);
    } catch (error) {
      return rejected(error?.message ?? "Failed to fetch admin courses");
    }
  }, []);

  const createCourse = useCallback(async (data) => {
    setAdminState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const res = await api.post("/courses", data);
      const payload = res.data.data.course;
      setAdminState((prev) => ({ ...prev, saving: false, courses: [payload, ...prev.courses] }));
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to create course";
      setAdminState((prev) => ({ ...prev, saving: false, error: message }));
      return rejected(message);
    }
  }, []);

  const updateCourse = useCallback(async ({ id, data }) => {
    setAdminState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const res = await api.patch(`/courses/${id}`, data);
      const payload = res.data.data.course;
      setAdminState((prev) => ({
        ...prev,
        saving: false,
        courses: prev.courses.map((course) => (course.id === payload.id ? payload : course)),
      }));
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to update course";
      setAdminState((prev) => ({ ...prev, saving: false, error: message }));
      return rejected(message);
    }
  }, []);

  const deleteCourse = useCallback(async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      setAdminState((prev) => ({
        ...prev,
        courses: prev.courses.filter((course) => course.id !== id),
      }));
      return fulfilled(id);
    } catch (error) {
      return rejected(error?.message ?? "Failed to delete course");
    }
  }, []);

  const publishCourse = useCallback(async (id) => {
    try {
      const res = await api.patch(`/courses/${id}/publish`);
      const payload = res.data.data.course;
      setAdminState((prev) => ({
        ...prev,
        courses: prev.courses.map((course) => (course.id === payload.id ? payload : course)),
      }));
      return fulfilled(payload);
    } catch (error) {
      return rejected(error?.message ?? "Failed to publish course");
    }
  }, []);

  const createSection = useCallback(async ({ courseId, data }) => {
    try {
      const res = await api.post(`/courses/${courseId}/sections`, data);
      return fulfilled(res.data.data.section);
    } catch (error) {
      return rejected(error?.message ?? "Failed to create section");
    }
  }, []);

  const createLesson = useCallback(async ({ sectionId, data }) => {
    try {
      const res = await api.post(`/sections/${sectionId}/lessons`, data);
      return fulfilled(res.data.data.lesson);
    } catch (error) {
      return rejected(error?.message ?? "Failed to create lesson");
    }
  }, []);

  const createGameLevel = useCallback(async ({ sectionId, data }) => {
    try {
      const res = await api.post(`/sections/${sectionId}/levels`, data);
      return fulfilled(res.data.data.level);
    } catch (error) {
      return rejected(error?.message ?? "Failed to create game level");
    }
  }, []);

  const fetchAdminRoadmaps = useCallback(async () => {
    setAdminState((prev) => ({ ...prev, roadmapsLoading: true }));
    try {
      const res = await api.get("/roadmaps", { params: { limit: 50 } });
      const payload = res.data.data.roadmaps ?? [];
      setAdminState((prev) => ({ ...prev, roadmapsLoading: false, roadmaps: payload }));
      return fulfilled(payload);
    } catch (error) {
      setAdminState((prev) => ({ ...prev, roadmapsLoading: false }));
      return rejected(error?.message ?? "Failed to fetch roadmaps");
    }
  }, []);

  const createRoadmap = useCallback(async (data) => {
    setAdminState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const res = await api.post("/roadmaps", data);
      const payload = res.data.data.roadmap;
      setAdminState((prev) => ({ ...prev, saving: false, roadmaps: [payload, ...prev.roadmaps] }));
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to create roadmap";
      setAdminState((prev) => ({ ...prev, saving: false, error: message }));
      return rejected(message);
    }
  }, []);

  const updateRoadmap = useCallback(async ({ id, data }) => {
    setAdminState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const res = await api.patch(`/roadmaps/${id}`, data);
      const payload = res.data.data.roadmap;
      setAdminState((prev) => ({
        ...prev,
        saving: false,
        roadmaps: prev.roadmaps.map((roadmap) => (roadmap.id === payload.id ? payload : roadmap)),
      }));
      return fulfilled(payload);
    } catch (error) {
      const message = error?.message ?? "Failed to update roadmap";
      setAdminState((prev) => ({ ...prev, saving: false, error: message }));
      return rejected(message);
    }
  }, []);

  const deleteRoadmap = useCallback(async (id) => {
    try {
      await api.delete(`/roadmaps/${id}`);
      setAdminState((prev) => ({
        ...prev,
        roadmaps: prev.roadmaps.filter((roadmap) => roadmap.id !== id),
      }));
      return fulfilled(id);
    } catch (error) {
      return rejected(error?.message ?? "Failed to delete roadmap");
    }
  }, []);

  const addCourseToRoadmap = useCallback(async ({ roadmapId, data }) => {
    try {
      const res = await api.post(`/roadmaps/${roadmapId}/courses`, data);
      return fulfilled(res.data.data.node);
    } catch (error) {
      return rejected(error?.message ?? "Failed to add course to roadmap");
    }
  }, []);

  const removeCourseFromRoadmap = useCallback(async ({ roadmapId, nodeId }) => {
    try {
      await api.delete(`/roadmaps/${roadmapId}/courses/${nodeId}`);
      return fulfilled(nodeId);
    } catch (error) {
      return rejected(error?.message ?? "Failed to remove course from roadmap");
    }
  }, []);

  const value = useMemo(
    () => ({
      courseList: coursesState.list,
      coursePagination: coursesState.pagination,
      currentCourse: coursesState.current,
      myCourses: coursesState.myCourses,
      currentLesson: coursesState.currentLesson,
      currentLevel: coursesState.currentLevel,
      coursesLoading: coursesState.loading,
      myCoursesLoading: coursesState.myLoading,
      lessonLoading: coursesState.lessonLoading,
      levelLoading: coursesState.levelLoading,
      coursesError: coursesState.error,

      enrollment: enrollState.enrollment,
      courseProgress: enrollState.progress,
      lastAttemptResult: enrollState.lastAttemptResult,
      enrollmentLoading: enrollState.loading,
      enrollLoading: enrollState.enrollLoading,
      attemptLoading: enrollState.attemptLoading,
      enrollError: enrollState.error,

      roadmapList: roadmapState.list,
      roadmapPagination: roadmapState.pagination,
      currentRoadmap: roadmapState.current,
      roadmapEnrollment: roadmapState.enrollment,
      myRoadmaps: roadmapState.myRoadmaps,
      roadmapLoading: roadmapState.loading,
      myRoadmapsLoading: roadmapState.myLoading,
      roadmapEnrollLoading: roadmapState.enrollLoading,
      roadmapError: roadmapState.error,

      adminStats: adminState.stats,
      adminCourses: adminState.courses,
      adminRoadmaps: adminState.roadmaps,
      adminPagination: adminState.pagination,
      adminEditingCourse: adminState.editingCourse,
      adminLoading: adminState.loading,
      adminRoadmapsLoading: adminState.roadmapsLoading,
      adminSaving: adminState.saving,
      adminError: adminState.error,

      streak: gamificationState.streak,
      longestStreak: gamificationState.longestStreak,
      lastActivityAt: gamificationState.lastActivityAt,
      totalActiveDays: gamificationState.totalActiveDays,
      calendar: gamificationState.calendar,
      xpTotal: gamificationState.xpTotal,
      gamificationLevel: gamificationState.level,
      leaderboard: gamificationState.leaderboard,
      onboarding: gamificationState.onboarding,
      showLevelUp: gamificationState.showLevelUp,
      newLevel: gamificationState.newLevel,
      streakLoading: gamificationState.streakLoading,
      streakError: gamificationState.streakError,
      gamificationLoading: gamificationState.loading,

      fetchCourses,
      fetchCourseBySlug,
      fetchMyCourses,
      fetchLesson,
      fetchLevel,
      fetchEnrollment,
      fetchCourseProgress,
      enrollInCourse,
      updateLessonProgress,
      submitLevelAttempt,
      skipSection,
      fetchRoadmaps,
      fetchRoadmapBySlug,
      fetchRoadmapEnrollment,
      fetchMyRoadmaps,
      enrollInRoadmap,
      skipTrackNode,
      fetchStreak,
      fetchLeaderboard,
      setOnboardingField,
      completeOnboarding,
      addXp,
      dismissLevelUp,
      clearAttemptResult,
      fetchAdminStats,
      fetchAdminCourses,
      createCourse,
      updateCourse,
      deleteCourse,
      publishCourse,
      createSection,
      createLesson,
      createGameLevel,
      fetchAdminRoadmaps,
      createRoadmap,
      updateRoadmap,
      deleteRoadmap,
      addCourseToRoadmap,
      removeCourseFromRoadmap,
    }),
    [
      coursesState,
      enrollState,
      roadmapState,
      adminState,
      gamificationState,
      fetchCourses,
      fetchCourseBySlug,
      fetchMyCourses,
      fetchLesson,
      fetchLevel,
      fetchEnrollment,
      fetchCourseProgress,
      enrollInCourse,
      updateLessonProgress,
      submitLevelAttempt,
      skipSection,
      fetchRoadmaps,
      fetchRoadmapBySlug,
      fetchRoadmapEnrollment,
      fetchMyRoadmaps,
      enrollInRoadmap,
      skipTrackNode,
      fetchStreak,
      fetchLeaderboard,
      setOnboardingField,
      completeOnboarding,
      addXp,
      dismissLevelUp,
      clearAttemptResult,
      fetchAdminStats,
      fetchAdminCourses,
      createCourse,
      updateCourse,
      deleteCourse,
      publishCourse,
      createSection,
      createLesson,
      createGameLevel,
      fetchAdminRoadmaps,
      createRoadmap,
      updateRoadmap,
      deleteRoadmap,
      addCourseToRoadmap,
      removeCourseFromRoadmap,
    ]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourse must be used inside CourseProvider");
  return context;
};
