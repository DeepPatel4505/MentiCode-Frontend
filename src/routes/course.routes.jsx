import { Navigate } from "react-router-dom";
import GlobalLayout from "@/layouts/GlobalLayout";
import CourseSidebar from "@/features/course/sidebar/CourseSidebar";

import CoursesPage from "@/features/course/pages/CoursesPage";
import CourseDetailPage from "@/features/course/pages/CourseDetailPage";
import LessonPlayerPage from "@/features/course/pages/LessonPlayerPage";
import RoadmapsPage from "@/features/course/roadmap/pages/RoadmapsPage";
import RoadmapDetailPage from "@/features/course/roadmap/pages/RoadmapDetailPage";
import PricingPage from "@/features/course/pro/pages/PricingPage";
import LeaderboardPage from "@/features/course/gameLevel/pages/LeaderboardPage";
import GameLevelPage from "@/features/course/gameLevel/pages/GameLevelPage";
import OnboardingPage from "@/features/course/onboarding/pages/OnboardingPage";
import MyLearningPage from "@/features/course/enrollment/pages/MyLearningPage";
import AdminLayout from "@/features/course/admin/layout/AdminLayout";
import AdminDashboard from "@/features/course/admin/pages/AdminDashboard";
import AdminCourses from "@/features/course/admin/pages/AdminCourses";
import AdminCourseEditor from "@/features/course/admin/pages/AdminCourseEditor";
import AdminRoadmaps from "@/features/course/admin/pages/AdminRoadmaps";
import AdminRoadmapEditor from "@/features/course/admin/pages/AdminRoadmapEditor";
import AdminUsers from "@/features/course/admin/pages/AdminUsers";
import AdminAnalytics from "@/features/course/admin/pages/AdminAnalytics";

// ── Route Guards (components, not hooks — for loader pattern) ──
import PrivateRoute from "./guards/PrivateRoute";
import AdminRoute from "./guards/AdminRoute";
import OnboardRoute from "./guards/OnboardRoute";

const withCourseLayout = (page) => (
    <GlobalLayout featureSidebar={<CourseSidebar />}>{page}</GlobalLayout>
);

const courseRoutes = [
    { path: "/", element: withCourseLayout(<CoursesPage />) },
    { path: "/courses/:slug", element: withCourseLayout(<CourseDetailPage />) },
    { path: "/roadmaps", element: withCourseLayout(<RoadmapsPage />) },
    { path: "/roadmaps/:slug", element: withCourseLayout(<RoadmapDetailPage />) },
    { path: "/pricing", element: withCourseLayout(<PricingPage />) },
    { path: "/leaderboard", element: withCourseLayout(<LeaderboardPage />) },

    // ── Onboarding ─────────────────────────────────────────────
    {
        path: "/onboarding",
        element: (
            <PrivateRoute>
                <OnboardingPage />
            </PrivateRoute>
        ),
    },

    // ── Protected ──────────────────────────────────────────────
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
                <OnboardRoute>
                    {withCourseLayout(<LessonPlayerPage />)}
                </OnboardRoute>
            </PrivateRoute>
        ),
    },
    {
        path: "/courses/:slug/levels/:levelId",
        element: (
            <PrivateRoute>
                <OnboardRoute>
                    {withCourseLayout(<GameLevelPage />)}
                </OnboardRoute>
            </PrivateRoute>
        ),
    },
    {
        path: "/my-learning",
        element: (
            <PrivateRoute>
                <OnboardRoute>
                    {withCourseLayout(<MyLearningPage />)}
                </OnboardRoute>
            </PrivateRoute>
        ),
    },
    // ── Admin ──────────────────────────────────────────────────
    {
        path: "/admin",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: "courses", element: <AdminCourses /> },
            { path: "courses/new", element: <AdminCourseEditor /> },
            { path: "courses/:id/edit", element: <AdminCourseEditor /> },
            { path: "roadmaps", element: <AdminRoadmaps /> },
            { path: "roadmaps/new", element: <AdminRoadmapEditor /> },
            { path: "roadmaps/:id/edit", element: <AdminRoadmapEditor /> },
            { path: "users", element: <AdminUsers /> },
            { path: "analytics", element: <AdminAnalytics /> },
        ],
    },
];

export default courseRoutes;
