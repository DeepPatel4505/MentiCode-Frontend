import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BookOpen, Map, CheckCircle2, Clock, Zap, ChevronRight, Lock } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { PageHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Progress, Skeleton, Badge, EmptyState } from "@/components/ui/index";
import { fetchMyCourses, selectMyCourses, selectMyCoursesLoading } from "@/app/store/slices/courseSlice";
import { fetchMyRoadmaps, selectMyRoadmaps, selectMyRoadmapsLoading } from "@/app/store/slices/roadmapSlice";
import { selectIsPro } from "@/app/store/slices/authSlice";
import { cn, getDifficultyConfig, formatXp } from "@/lib/utils";

function CourseCard({ course }) {
  const pct  = Math.round((course.enrollment?.courseProgress?.overallProgress ?? 0) * 100);
  const diff = getDifficultyConfig(course.difficulty);
  const done = course.enrollment?.status === "completed";

  return (
    <Link to={`/courses/${course.slug}`}>
      <Card className="group h-full hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-blue-900/10 relative overflow-hidden">
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-primary/20" /></div>
          }
          <div className="absolute top-3 right-3">
            {done
              ? <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/20 border border-success/30 text-xs font-medium text-green-400 backdrop-blur-sm">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              : <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/70 border border-border text-xs text-muted-foreground backdrop-blur-sm">
                  <Clock className="w-3 h-3" /> {pct}%
                </span>
            }
          </div>
        </div>
        <CardContent className="p-4 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
            <span className={cn("text-xs font-medium", diff.color)}>{diff.label}</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span><span className="font-medium text-foreground">{pct}%</span>
            </div>
            <Progress value={pct} color={done ? "bg-emerald-500" : undefined} />
          </div>
          {course.enrollment?.xpEarned > 0 && (
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Zap className="w-3 h-3" /> {course.enrollment.xpEarned} XP
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function RoadmapCard({ enrollment }) {
  const roadmap = enrollment.roadmap ?? {};
  const pct = Math.round((enrollment.progress ?? 0) * 100);
  const done = pct >= 100;

  return (
    <Link to={`/roadmaps/${roadmap.slug}`}>
      <Card className="group hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden h-full flex flex-col">
        <div className="h-1 bg-gradient-to-r from-primary to-blue-400 shrink-0" />
        <CardContent className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              {done && <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Done</span>}
              <Badge variant="pro">PRO</Badge>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">{roadmap.title}</h3>
            {roadmap.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{roadmap.description}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span className={cn("font-semibold", done ? "text-emerald-400" : "text-foreground")}>{pct}%</span>
            </div>
            <Progress value={pct} color={done ? "bg-emerald-500" : undefined} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyLearningPage() {
  const dispatch       = useDispatch();
  const isPro          = useSelector(selectIsPro);
  const courses        = useSelector(selectMyCourses);
  const loading        = useSelector(selectMyCoursesLoading);
  const roadmapEnrollments = useSelector(selectMyRoadmaps);
  const roadmapsLoading    = useSelector(selectMyRoadmapsLoading);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => { dispatch(fetchMyCourses()); }, [dispatch]);

  useEffect(() => {
    if (isPro) dispatch(fetchMyRoadmaps());
  }, [dispatch, isPro]);

  const active    = courses.filter((c) => c.enrollment?.status !== "completed");
  const completed = courses.filter((c) => c.enrollment?.status === "completed");

  const tabs = [
    { id: "courses",  label: "My Courses",  count: courses.length },
    { id: "roadmaps", label: "My Roadmaps", count: roadmapEnrollments.length },
  ];

  return (
    <Shell>
      <PageHeader title="My Learning" description="Track your progress and pick up where you left off" />

      {/* Summary bar */}
      {courses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Enrolled",   value: courses.length },
            { label: "Completed",  value: completed.length },
            { label: "In progress",value: active.length },
            { label: "Total XP",   value: formatXp(courses.reduce((a, c) => a + (c.enrollment?.xpEarned ?? 0), 0)) },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl border border-border bg-card text-center">
              <p className="text-xl font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-8 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            {tab.label}
            {tab.count > 0 && (
              <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-bold",
                activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-border text-muted-foreground"
              )}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Courses */}
      {activeTab === "courses" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Enroll in a course to start learning and track your progress here."
              action={<Button variant="gradient" asChild><Link to="/courses">Browse courses</Link></Button>}
            />
          ) : (
            <div className="space-y-8">
              {active.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> In progress
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {active.map((c) => <CourseCard key={c.id} course={c} />)}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Completed
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {completed.map((c) => <CourseCard key={c.id} course={c} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Roadmaps */}
      {activeTab === "roadmaps" && (
        <div>
          {!isPro ? (
            <div className="max-w-md mx-auto">
              <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-background p-6 text-center">
                <Lock className="w-10 h-10 text-primary/50 mx-auto mb-3" />
                <h2 className="font-bold text-lg mb-2">Roadmaps are Pro-only</h2>
                <p className="text-muted-foreground text-sm mb-5">Upgrade to access guided learning paths that take you from zero to job-ready.</p>
                <Button variant="gradient" className="w-full" asChild>
                  <Link to="/pricing">Upgrade to Pro</Link>
                </Button>
              </Card>
            </div>
          ) : roadmapsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
            </div>
          ) : roadmapEnrollments.length === 0 ? (
            <EmptyState
              icon={Map}
              title="No roadmaps enrolled"
              description="Pick a structured learning path and start your journey."
              action={<Button variant="gradient" asChild><Link to="/roadmaps">Browse roadmaps</Link></Button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {roadmapEnrollments.map((e) => <RoadmapCard key={e.id} enrollment={e} />)}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
