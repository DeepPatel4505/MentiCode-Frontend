import { createBrowserRouter, Navigate } from "react-router-dom";

// ── Layouts ───────────────────────────────────────────────────
import GlobalLayout from "@/layouts/GlobalLayout";

// ── Sidebars ──────────────────────────────────────────────────
import CourseSidebar  from "@/features/course/sidebar/CourseSidebar";
import AnalyzeSidebar from "@/features/analyze/sidebar/AnalyzeSidebar";
import ProfileSidebar from "@/features/profile/sidebar/ProfileSidebar";

// ── Auth Pages ────────────────────────────────────────────────
import LoginPage          from "@/features/auth/pages/LoginPage";
import RegisterPage       from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage  from "@/features/auth/pages/ResetPasswordPage";
import VerifyEmailPage    from "@/features/auth/pages/VerifyEmailPage";
import OAuthCallbackPage  from "@/features/auth/pages/OAuthCallbackPage";

// ── Onboarding ────────────────────────────────────────────────
import OnboardingPage from "@/features/course/onboarding/pages/OnboardingPage";

// ── Course Pages ──────────────────────────────────────────────
import CoursesPage       from "@/features/course/pages/CoursesPage";
import CourseDetailPage  from "@/features/course/pages/CourseDetailPage";
import RoadmapsPage      from "@/features/course/roadmap/pages/RoadmapsPage";
import RoadmapDetailPage from "@/features/course/roadmap/pages/RoadmapDetailPage";
import PricingPage       from "@/features/course/pro/pages/PricingPage";
import DashboardPage     from "@/features/dashboard/pages/DashboardPage";
import LessonPlayerPage  from "@/features/course/pages/LessonPlayerPage";
import GameLevelPage     from "@/features/course/gameLevel/pages/GameLevelPage";
import MyLearningPage    from "@/features/course/enrollment/pages/MyLearningPage";
import ProfilePage       from "@/features/profile/pages/ProfilePage";
import LeaderboardPage   from "@/features/course/gameLevel/pages/LeaderboardPage";

// ── Admin Pages ───────────────────────────────────────────────
import AdminLayout        from "@/features/course/admin/layout/AdminLayout";
import AdminDashboard     from "@/features/course/admin/pages/AdminDashboard";
import AdminCourses       from "@/features/course/admin/pages/AdminCourses";
import AdminCourseEditor  from "@/features/course/admin/pages/AdminCourseEditor";
import AdminRoadmaps      from "@/features/course/admin/pages/AdminRoadmaps";
import AdminRoadmapEditor from "@/features/course/admin/pages/AdminRoadmapEditor";
import AdminUsers         from "@/features/course/admin/pages/AdminUsers";
import AdminAnalytics     from "@/features/course/admin/pages/AdminAnalytics";

// ── Analyze Pages ─────────────────────────────────────────────
import AnalyzeHome          from "@/features/analyze/pages/AnalyzeHome";
import PlaygroundPage       from "@/features/analyze/pages/PlaygroundPage";
import PlaygroundEditorPage from "@/features/analyze/pages/PlaygroundEditorPage";
import CreateNewPlayground  from "@/features/analyze/pages/CreateNewPlayground";
import JobResultPage        from "@/features/analyze/pages/JobResultPage";

// ── Route Guards ──────────────────────────────────────────────
import PrivateRoute from "./guards/PrivateRoute";
import AdminRoute   from "./guards/AdminRoute";
import GuestRoute   from "./guards/GuestRoute";
import OnboardRoute from "./guards/OnboardRoute";

// ── Layout helpers ────────────────────────────────────────────
const withCourseLayout = (page) => (
  <GlobalLayout featureSidebar={<CourseSidebar />}>{page}</GlobalLayout>
);

const withAnalyzeLayout = (page) => (
  <PrivateRoute>
    <OnboardRoute>
      <GlobalLayout featureSidebar={<AnalyzeSidebar />}>{page}</GlobalLayout>
    </OnboardRoute>
  </PrivateRoute>
);

const withProfileLayout = (page) => (
  <PrivateRoute>
    <OnboardRoute>
      <GlobalLayout featureSidebar={<ProfileSidebar />}>{page}</GlobalLayout>
    </OnboardRoute>
  </PrivateRoute>
);

export const router = createBrowserRouter([

  // ── Public Course Pages (with course sidebar) ──────────────
  { path: "/",               element: withCourseLayout(<CoursesPage />) },
  { path: "/courses/:slug",  element: <CourseDetailPage /> },
  { path: "/roadmaps",       element: withCourseLayout(<RoadmapsPage />) },
  { path: "/roadmaps/:slug", element: withCourseLayout(<RoadmapDetailPage />) },
  { path: "/pricing",        element: withCourseLayout(<PricingPage />) },
  { path: "/leaderboard",    element: withCourseLayout(<LeaderboardPage />) },

  // ── Auth (guest only) ──────────────────────────────────────
  { path: "/login",                 element: <GuestRoute><LoginPage /></GuestRoute> },
  { path: "/register",              element: <GuestRoute><RegisterPage /></GuestRoute> },
  { path: "/forgot-password",       element: <GuestRoute><ForgotPasswordPage /></GuestRoute> },
  { path: "/reset-password/:token", element: <GuestRoute><ResetPasswordPage /></GuestRoute> },
  { path: "/verify-email/:token",   element: <VerifyEmailPage /> },

  // ── OAuth callback — backend redirects here after Google/GitHub login ──
  { path: "/auth/callback",         element: <OAuthCallbackPage /> },

  // ── Onboarding ─────────────────────────────────────────────
  { path: "/onboarding", element: <PrivateRoute><OnboardingPage /></PrivateRoute> },

  // ── Protected Course Pages ─────────────────────────────────
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <OnboardRoute>
          <Navigate to="/my-learning" replace />
        </OnboardRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/courses/:slug/lessons/:lessonId",
    element: (
      <PrivateRoute>
        <OnboardRoute><LessonPlayerPage /></OnboardRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/courses/:slug/levels/:levelId",
    element: (
      <PrivateRoute>
        <OnboardRoute><GameLevelPage /></OnboardRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/my-learning",
    element: (
      <PrivateRoute>
        <OnboardRoute>{withCourseLayout(<MyLearningPage />)}</OnboardRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: withProfileLayout(<ProfilePage />),
  },
  {
    path: "/profile/:userId",
    element: withProfileLayout(<ProfilePage />),
  },

  // ── Analyze Routes (with analyze sidebar) ──────────────────
  { path: "/analyze",                    element: withAnalyzeLayout(<AnalyzeHome />) },
  { path: "/analyze/playground",         element: withAnalyzeLayout(<PlaygroundPage />) },
  { path: "/analyze/my-analysis",        element: withAnalyzeLayout(<JobResultPage />) },
  { path: "/analyze/my-analysis/:jobId", element: withAnalyzeLayout(<JobResultPage />) },
  { path: "/analyze/job-result",         element: withAnalyzeLayout(<JobResultPage />) },
  { path: "/analyze/job-result/:jobId",  element: withAnalyzeLayout(<JobResultPage />) },
  // Full-screen — manage their own chrome
  { path: "/analyze/playground/new",     element: <PrivateRoute><CreateNewPlayground /></PrivateRoute> },
  { path: "/analyze/playground/:id",     element: <PrivateRoute><PlaygroundEditorPage /></PrivateRoute> },

  // ── Admin ──────────────────────────────────────────────────
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true,               element: <AdminDashboard /> },
      { path: "courses",           element: <AdminCourses /> },
      { path: "courses/new",       element: <AdminCourseEditor /> },
      { path: "courses/:id/edit",  element: <AdminCourseEditor /> },
      { path: "roadmaps",          element: <AdminRoadmaps /> },
      { path: "roadmaps/new",      element: <AdminRoadmapEditor /> },
      { path: "roadmaps/:id/edit", element: <AdminRoadmapEditor /> },
      { path: "users",             element: <AdminUsers /> },
      { path: "analytics",         element: <AdminAnalytics /> },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
