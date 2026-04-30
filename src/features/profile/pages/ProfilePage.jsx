import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Zap, BookOpen, Map, Trophy, Star, CheckCircle2, Clock, TrendingUp, Github } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Badge, Progress, Skeleton, Avatar } from "@/components/ui/index";
import { selectUser, selectIsPro, setCredentials } from "@/app/store/slices/authSlice";
import { fetchMyCourses, selectMyCourses, selectMyCoursesLoading } from "@/app/store/slices/courseSlice";
import { fetchMyRoadmaps, selectMyRoadmaps, selectMyRoadmapsLoading } from "@/app/store/slices/roadmapSlice";
import { selectXpTotal, selectGamificationLevel, getXpProgress } from "@/app/store/slices/gamificationSlice";
import { cn, formatXp, timeAgo } from "@/lib/utils";
import api from "@/lib/axios";

function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="stat-card text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <p className="text-2xl font-bold mb-0.5">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Roadmap-style compact row for a course
function CourseRow({ course }) {
  const pct  = Math.round((course.enrollment?.courseProgress?.overallProgress ?? 0) * 100);
  const href = course.enrollment?.courseProgress?.currentLessonId
    ? `/courses/${course.slug}/lessons/${course.enrollment.courseProgress.currentLessonId}`
    : `/courses/${course.slug}`;

  return (
    <Link to={href}>
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border hover:border-primary/30 bg-card transition-all group">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary/60" />
        </div>
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
        {pct === 100 && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user      = useSelector(selectUser);
  const isPro     = useSelector(selectIsPro);
  const courses   = useSelector(selectMyCourses);
  const loading   = useSelector(selectMyCoursesLoading);
  const roadmaps  = useSelector(selectMyRoadmaps);
  const roadmapsLoading = useSelector(selectMyRoadmapsLoading);
  const xpTotal   = useSelector(selectXpTotal);
  const level     = useSelector(selectGamificationLevel);

  const activeSection = searchParams.get("section") === "settings" ? "settings" : "info";
  const isGithubConnected =
    Boolean(user?.githubId) ||
    Boolean(user?.githubAccessToken) ||
    (user?.loginProvider || "").toLowerCase() === "github";

  // Handle OAuth redirect: /profile?token=<jwt> or GitHub connection return
  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("accessToken");
    
    // Only process if token exists
    if (!token) return;

    // Remove token from URL immediately
    setSearchParams({}, { replace: true });
    localStorage.setItem("accessToken", token);

    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const userData = res.data?.data?.user ?? res.data?.data ?? res.data;
        dispatch(setCredentials({ user: userData, accessToken: token }));
        // Don't redirect if already on profile page
        if (userData?.role === "admin") navigate("/admin", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
      });
  }, []);

  // Detect GitHub connection success and refresh user state
  useEffect(() => {
    const isGithubConnected = searchParams.get("github") === "connected";
    if (!isGithubConnected) return;

    // Remove github parameter from URL
    setSearchParams({}, { replace: true });

    // Fetch fresh user data to show updated GitHub connection
    api.get("/auth/me")
      .then((res) => {
        const userData = res.data?.data?.user ?? res.data?.data ?? res.data;
        if (userData) {
          dispatch(setCredentials({ user: userData, accessToken: localStorage.getItem("accessToken") }));
        }
      })
      .catch(() => {
        // Silent fail - stay on page
      });
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchMyCourses());
    dispatch(fetchMyRoadmaps());
  }, [dispatch, user?.id]);

  const completed  = courses.filter((c) => (c.enrollment?.courseProgress?.overallProgress ?? 0) >= 1);
  const inProgress = courses.filter((c) => (c.enrollment?.courseProgress?.overallProgress ?? 0) < 1);
  const { pct: xpPct, current: xpCurrent, next: xpNext, xpInLevel, xpNeeded } = getXpProgress(xpTotal);

  if (!user) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <Shell>
      {/* Profile header */}
      <div className="mb-8 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-24 sm:h-28 bg-gradient-to-r from-violet-900/45 via-primary/20 to-violet-800/35" />
        <div className="-mt-8 px-4 sm:px-6 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative w-fit">
              <Avatar src={user.avatarUrl} name={user.username} size="xl" className="ring-4 ring-card" />
              {isPro && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-card">
                  <Star className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">{user.username}</h1>
                {isPro && <Badge variant="pro">PRO</Badge>}
                {user.role === "admin" && <Badge variant="destructive">Admin</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">Level {level}</Badge>
                <Badge variant="secondary">{formatXp(xpTotal)} XP</Badge>
                <Badge variant="secondary">{courses.length} Courses</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={BookOpen}     label="Courses"   value={courses.length}    />
            <StatCard icon={CheckCircle2} label="Completed" value={completed.length}  color="text-green-400" />
            <StatCard icon={Zap}          label="Total XP"  value={formatXp(xpTotal)} />
            <StatCard icon={TrendingUp}   label="Level"     value={level}             />
          </div>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Level {xpCurrent.level}</span>
                <span className="text-xs text-muted-foreground">{formatXp(xpTotal)} XP</span>
              </div>
              <Progress value={xpPct} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {xpNext ? `${xpNeeded - xpInLevel} XP to Level ${xpNext.level}` : "Max level reached!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <h3 className="font-semibold text-sm">Account info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  {isPro
                    ? <Badge variant="pro">PRO</Badge>
                    : <div className="flex items-center gap-2">
                        <span>Free</span>
                        <Link to="/pricing" className="text-xs text-primary hover:underline">Upgrade</Link>
                      </div>
                  }
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{timeAgo(user.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email verified</span>
                  <span>{user.isEmailVerified
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 inline" />
                    : <span className="text-amber-400 text-xs">Pending</span>
                  }</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sign-in method</span>
                  <span className="capitalize">{user.loginProvider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isPro && (
            <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-background">
              <CardContent className="pt-5 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Unlock everything</h3>
                <p className="text-xs text-muted-foreground mb-3">Get full access to all courses, roadmaps and features.</p>
                <Button variant="gradient" size="sm" className="w-full" asChild>
                  <Link to="/pricing">Go Pro - $12/mo</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          {activeSection === "info" && (
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No courses enrolled yet</p>
                    <Button variant="gradient" size="sm" asChild><Link to="/courses">Browse courses</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inProgress.length > 0 && (
                      <div>
                        <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" /> In progress ({inProgress.length})
                        </h2>
                        <div className="space-y-2">
                          {inProgress.map((c) => <CourseRow key={c.id} course={c} />)}
                        </div>
                      </div>
                    )}
                    {completed.length > 0 && (
                      <div>
                        <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400" /> Completed ({completed.length})
                        </h2>
                        <div className="space-y-2">
                          {completed.map((c) => <CourseRow key={c.id} course={c} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "settings" && (
            <div className="space-y-5">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Integration</p>
                      <h3 className="text-lg font-semibold mt-1">GitHub Connection</h3>
                      <p className="text-sm text-muted-foreground mt-1">Connect GitHub to import repositories into Analyze workflows.</p>
                    </div>
                    <Badge variant={isGithubConnected ? "success" : "warning"}>
                      {isGithubConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Github className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">GitHub Account</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {isGithubConnected
                            ? `Linked as ${(user?.githubId || user?.username || "GitHub user")}`
                            : "No GitHub account linked yet."}
                        </p>
                      </div>
                    </div>

                    {!isGithubConnected && (
                      <Button size="sm" asChild>
                        <a href="/api/v1/auth/github/connect">Connect GitHub</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold text-sm">Account Settings</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Display name</span>
                      <span>{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roadmaps enrolled</span>
                      <span>{roadmapsLoading ? "Loading..." : roadmaps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Achievements</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Trophy className="w-3.5 h-3.5" />
                        Coming soon
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "info" && (
            <Card className="mt-5">
              <CardContent className="pt-6">
                {roadmapsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                  </div>
                ) : roadmaps.length === 0 ? (
                  <div className="text-center py-10">
                    <Map className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No roadmap enrollments yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roadmaps.map((enrollment) => {
                      const roadmap = enrollment.roadmap ?? enrollment;
                      const pct = Math.round((enrollment.progress ?? 0) * 100);
                      return (
                        <Link key={enrollment.id} to={`/roadmaps/${roadmap.slug}`}>
                          <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border hover:border-primary/30 bg-card transition-all group">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                              <Map className="w-4 h-4 text-primary/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{roadmap.title ?? roadmap.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{pct}%</span>
                              </div>
                            </div>
                            {pct === 100 && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
