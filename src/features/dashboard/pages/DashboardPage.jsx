import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Zap, BookOpen, Trophy, ChevronRight, ArrowRight, Play } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Card, CardContent, Progress, Badge, Skeleton, Avatar } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import { fetchCourses, fetchMyCourses, selectCourses, selectMyCourses, selectCoursesLoading } from "@/app/store/slices/courseSlice";
import { fetchLeaderboard, selectLeaderboard, selectXpTotal, getXpProgress, selectCalendar, selectTotalActiveDays } from "@/app/store/slices/gamificationSlice";
import { selectUser } from "@/app/store/slices/authSlice";
import { cn, formatXp, getDifficultyConfig } from "@/lib/utils";
import StreakCalendar from "@/features/dashboard/components/StreakCalendar";

// ── XP level math (local fallback) ───────────────────────────
// getXpProgress is imported from gamificationSlice for accurate level thresholds

// ── MyCourses compact list (roadmap-style rows) ───────────────
function MyCoursesList({ myCourses, loading }) {
  if (loading) return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
    </div>
  );

  const sorted = [...(myCourses ?? [])].sort((a, b) =>
    new Date(b.enrollment?.updatedAt ?? 0) - new Date(a.enrollment?.updatedAt ?? 0)
  ).slice(0, 5);

  if (!sorted.length) return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <BookOpen className="w-5 h-5 text-muted-foreground/40 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">No courses yet</p>
        <p className="text-xs text-muted-foreground">Start learning today</p>
      </div>
      <Button variant="gradient" size="xs" asChild>
        <Link to="/courses">Browse</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-2">
      {sorted.map((course) => {
        const pct = Math.round((course.enrollment?.courseProgress?.overallProgress ?? 0) * 100);
        const href = course.enrollment?.courseProgress?.currentLessonId
          ? `/courses/${course.slug}/lessons/${course.enrollment.courseProgress.currentLessonId}`
          : `/courses/${course.slug}`;

        return (
          <Link key={course.id} to={href} className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent/30 transition-all">
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary/60" />
            </div>

            {/* Title + bar */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{course.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-emerald-500" : "bg-primary")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{pct}%</span>
              </div>
            </div>

            {/* Resume icon */}
            <Play className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}

// ── DailyActivity widget ──────────────────────────────────────
function DailyActivity({ calendar, totalActiveDays }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Activity</span>
        </div>
        <StreakCalendar
          calendar={calendar}
          totalActiveDays={totalActiveDays}
        />
      </CardContent>
    </Card>
  );
}

// ── XpProgressBar widget ──────────────────────────────────────
function XpProgressBar({ xpTotal }) {
  const { pct, current, next, xpInLevel, xpNeeded } = getXpProgress(xpTotal ?? 0);
  const toNext = xpNeeded - xpInLevel;
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Level {current.level}</span>
          </div>
          <span className="text-xs text-muted-foreground">{formatXp(xpTotal ?? 0)} XP</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {next
          ? <p className="text-xs text-muted-foreground mt-1.5 text-right">{toNext} XP to Level {next.level}</p>
          : <p className="text-xs text-primary mt-1.5 text-right font-medium">Max level reached!</p>
        }
      </CardContent>
    </Card>
  );
}

// ── SuggestedCourses widget ───────────────────────────────────
function SuggestedCourses({ courses, myCourses, loading }) {
  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  );

  const enrolledIds = new Set((myCourses ?? []).map((c) => c.id));
  const suggestions = (courses ?? []).filter((c) => !enrolledIds.has(c.id)).slice(0, 3);

  if (!suggestions.length) return (
    <p className="text-sm text-muted-foreground text-center py-4">You're enrolled in all available courses!</p>
  );

  return (
    <div className="space-y-3">
      {suggestions.map((c) => {
        const diff = getDifficultyConfig(c.difficulty);
        return (
          <Link key={c.id} to={`/courses/${c.slug}`}>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 bg-card transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {c.thumbnail
                  ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  : <BookOpen className="w-5 h-5 text-primary/50" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{c.title}</p>
                <span className={cn("text-xs", diff.color)}>{diff.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── WeeklyChallenges widget ───────────────────────────────────
function WeeklyChallenges() {
  const key      = "wc_progress";
  const progress = parseInt(localStorage.getItem(key) ?? "0", 10);
  const goal     = 3;
  const pct      = Math.min(100, (progress / goal) * 100);

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-sm">Weekly challenge</span>
          <Badge variant="warning" className="ml-auto text-xs">{progress}/{goal}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Complete {goal} levels this week</p>
        <Progress value={pct} color="bg-amber-400" className="h-2" />
        {pct >= 100 && <p className="text-xs text-amber-400 mt-1.5 font-medium">Challenge complete! 🎉</p>}
      </CardContent>
    </Card>
  );
}

// ── LeaderboardPreview widget ─────────────────────────────────
function LeaderboardPreview({ leaderboard }) {
  const top5 = (leaderboard ?? []).slice(0, 5);
  return (
    <div className="space-y-2">
      {top5.map((entry, i) => (
        <div key={entry.rank ?? i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card">
          <span className="w-5 text-center text-xs font-bold text-muted-foreground">{entry.rank ?? i + 1}</span>
          <Avatar src={entry.avatarUrl} name={entry.username} size="sm" />
          <span className="flex-1 text-sm font-medium truncate">{entry.username}</span>
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-bold">{formatXp(entry.xpTotal)}</span>
          </div>
        </div>
      ))}
      <Link to="/leaderboard" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1">
        View full leaderboard <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ── DashboardPage ─────────────────────────────────────────────
export default function DashboardPage() {
  const dispatch    = useDispatch();
  const user        = useSelector(selectUser);
  const courses     = useSelector(selectCourses);
  const myCourses   = useSelector(selectMyCourses);
  const loading     = useSelector(selectCoursesLoading);
  const totalActiveDays = useSelector(selectTotalActiveDays);
  const calendar       = useSelector(selectCalendar);
  const xpTotal        = useSelector(selectXpTotal);
  const leaderboard    = useSelector(selectLeaderboard);

  useEffect(() => {
    dispatch(fetchMyCourses());
    dispatch(fetchCourses({ limit: 6 }));
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  return (
    <Shell>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back{user?.username ? `, ${user.username}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your learning.</p>
      </div>

      {/* My Courses — compact list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">My Courses</h2>
          <Link to="/my-learning" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <MyCoursesList myCourses={myCourses} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP + Streak row */}
          <div className="grid grid-cols-1 gap-4">
            <XpProgressBar xpTotal={xpTotal} />
            <DailyActivity
              calendar={calendar}
              totalActiveDays={totalActiveDays}
            />
          </div>

          {/* Suggested courses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Suggested for you</h2>
              <Link to="/courses" className="text-xs text-primary hover:underline flex items-center gap-1">
                All courses <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <SuggestedCourses courses={courses} myCourses={myCourses} loading={loading} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <WeeklyChallenges />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Top learners</h2>
            </div>
            <LeaderboardPreview leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
