import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Map, Lock, CheckCircle2, SkipForward, BookOpen,
  Zap, ArrowLeft, Users, Play,
} from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Progress, Badge, Skeleton } from "@/components/ui/index";
import {
  fetchRoadmapBySlug, fetchRoadmapEnrollment, enrollInRoadmap, skipTrackNode,
  selectCurrentRoadmap, selectRoadmapEnrollment, selectRoadmapLoading, selectRoadmapEnrollLoading,
} from "@/app/store/slices/roadmapSlice";
import { selectIsAuth, selectIsPro } from "@/app/store/slices/authSlice";
import { useToast } from "@/components/ui/Toast";
import { cn, getDifficultyConfig } from "@/lib/utils";

// ── Node status config ────────────────────────────────────────
const NODE_STATUS = {
  locked:      { ring: "border-border",        bg: "bg-secondary",       text: "text-muted-foreground" },
  unlocked:    { ring: "border-primary/60",     bg: "bg-primary/10",      text: "text-primary" },
  in_progress: { ring: "border-primary",        bg: "bg-primary/20",      text: "text-primary" },
  skipped:     { ring: "border-border",         bg: "bg-secondary",       text: "text-muted-foreground" },
  completed:   { ring: "border-emerald-500/60", bg: "bg-emerald-500/15",  text: "text-emerald-400" },
};

// ── Single course node ────────────────────────────────────────
function CourseNode({ node, idx, total, status, np, isEnrolled, onSkip }) {
  const course = node.course;
  const diff   = getDifficultyConfig(course?.difficulty);
  const cfg    = NODE_STATUS[status] ?? NODE_STATUS.locked;
  const pct    = np?.courseProgress > 0 ? Math.round(np.courseProgress * 100) : 0;
  const isLast = idx === total - 1;

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <div className={cn(
          "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          cfg.ring, cfg.bg
        )}>
          {status === "completed"
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            : status === "locked"
            ? <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
            : status === "skipped"
            ? <SkipForward className="w-3.5 h-3.5 text-muted-foreground" />
            : <span className={cn("text-xs font-bold", cfg.text)}>{idx + 1}</span>
          }
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 mt-1 min-h-[24px]",
            status === "completed" ? "bg-emerald-500/30" : "bg-border/60"
          )} />
        )}
      </div>

      {/* Card */}
      <div className={cn(
        "flex-1 mb-4 rounded-xl border transition-all duration-200",
        status === "completed"   ? "border-emerald-500/20 bg-emerald-500/[0.03]" :
        status === "in_progress" ? "border-primary/30 bg-primary/[0.03]" :
        status === "unlocked"    ? "border-border hover:border-primary/30 bg-card" :
        status === "skipped"     ? "border-dashed border-border/50 bg-secondary/30 opacity-60" :
        "border-border/40 bg-card/50 opacity-50"
      )}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
              status === "locked" ? "bg-secondary" : "bg-primary/10"
            )}>
              {course?.thumbnail
                ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                : <BookOpen className={cn("w-4 h-4", status === "locked" ? "text-muted-foreground/30" : "text-primary")} />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className={cn(
                    "font-semibold text-sm leading-snug",
                    status === "locked" ? "text-muted-foreground/60" : "text-foreground"
                  )}>
                    {course?.title ?? "Course"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs font-medium", diff.color)}>{diff.label}</span>
                    {course?.totalXp > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-primary/70 font-medium">
                        <Zap className="w-3 h-3" /> {course.totalXp} XP
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {status === "completed" && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                  {(status === "unlocked" || status === "in_progress") && course?.slug && isEnrolled && (
                    <Button size="sm" variant="gradient" className="gap-1 h-7 px-3 text-xs" asChild>
                      <Link to={`/courses/${course.slug}`}>
                        {status === "in_progress" ? <><Play className="w-3 h-3" /> Continue</> : "Start"}
                      </Link>
                    </Button>
                  )}
                  {(status === "unlocked" || status === "in_progress") && node.isSkippable && isEnrolled && (
                    <button
                      onClick={onSkip}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Skip this course"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {pct > 0 && status !== "completed" && (
                <div className="mt-2.5">
                  <Progress value={pct} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function RoadmapDetailPage() {
  const { slug }    = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { toast }   = useToast();

  const roadmap       = useSelector(selectCurrentRoadmap);
  const enrollment    = useSelector(selectRoadmapEnrollment);
  const loading       = useSelector(selectRoadmapLoading);
  const enrollLoading = useSelector(selectRoadmapEnrollLoading);
  const isAuth        = useSelector(selectIsAuth);
  const isPro         = useSelector(selectIsPro);

  useEffect(() => { dispatch(fetchRoadmapBySlug(slug)); }, [dispatch, slug]);
  useEffect(() => {
    if (roadmap?.id && isAuth) dispatch(fetchRoadmapEnrollment(roadmap.id));
  }, [dispatch, roadmap?.id, isAuth]);

  const courses    = roadmap?.courses ?? [];
  const isEnrolled = !!enrollment;
  const pct        = Math.round((enrollment?.progress ?? 0) * 100);

  // Build nodeProgress map
  const npMap = {};
  enrollment?.nodeProgress?.forEach((np) => { npMap[np.trackNodeId] = np; });

  const completedCount = courses.filter((n) => npMap[n.id]?.status === "completed").length;

  const handleEnroll = async () => {
    if (!isAuth)  { navigate("/register"); return; }
    if (!isPro)   { navigate("/pricing"); return; }
    const res = await dispatch(enrollInRoadmap({ roadmapId: roadmap.id }));
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Enrolled in roadmap!", type: "success" });
    } else {
      toast({ title: "Enrollment failed", description: res.payload, type: "error" });
    }
  };

  const handleSkipNode = async (nodeId) => {
    const res = await dispatch(skipTrackNode({ roadmapId: roadmap.id, nodeId }));
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Course skipped", type: "info" });
    else toast({ title: "Cannot skip", description: res.payload, type: "error" });
  };

  if (loading || !roadmap) return (
    <Shell>
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </Shell>
  );

  return (
    <Shell>
      {/* ── Hero ── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-blue-950/60 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-8">
          <Link to="/roadmaps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All roadmaps
          </Link>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              {roadmap.thumbnail
                ? <img src={roadmap.thumbnail} className="w-full h-full object-cover rounded-2xl" alt="" />
                : <Map className="w-7 h-7 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="pro">PRO</Badge>
                <Badge variant={roadmap.status === "published" ? "success" : "secondary"} className="capitalize">{roadmap.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{roadmap.title}</h1>
              {roadmap.description && <p className="text-muted-foreground max-w-2xl">{roadmap.description}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {courses.length} courses</span>
                {roadmap._count?.enrollments > 0 && (
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {roadmap._count.enrollments} enrolled</span>
                )}
              </div>
              {roadmap.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {roadmap.tags.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full text-xs bg-secondary border border-border/50 text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Course list ── */}
        <div className="lg:col-span-2 space-y-6">
          {isEnrolled && (
            <Card className="p-5 border-primary/20 bg-primary/[0.03]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">Your progress</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{completedCount}/{courses.length} courses completed</p>
                </div>
                <span className="text-2xl font-bold text-primary">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </Card>
          )}

          <div>
            <h2 className="font-semibold mb-4">Course path <span className="text-muted-foreground text-sm font-normal">({courses.length})</span></h2>
            {courses.length === 0 ? (
              <div className="flex flex-col items-center py-12 border border-dashed border-border rounded-2xl gap-2 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No courses in this roadmap yet.</p>
              </div>
            ) : courses.map((node, idx) => {
              const np     = npMap[node.id];
              const status = np?.status ?? (isEnrolled ? "unlocked" : "locked");
              return (
                <CourseNode
                  key={node.id}
                  node={node}
                  idx={idx}
                  total={courses.length}
                  status={status}
                  np={np}
                  isEnrolled={isEnrolled}
                  onSkip={() => handleSkipNode(node.id)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <div className="sticky top-20 space-y-4">
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-blue-400" />
              <CardContent className="p-5 space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Map className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold leading-snug">{roadmap.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{courses.length} courses</p>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Enrolled
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">{pct}% complete</p>
                  </div>
                ) : !isPro ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-center text-muted-foreground">
                      <Lock className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
                      Pro plan required to enroll
                    </div>
                    <Button variant="gradient" className="w-full gap-2" asChild>
                      <Link to="/pricing"><Zap className="w-4 h-4" /> Upgrade to Pro</Link>
                    </Button>
                  </div>
                ) : (
                  <Button variant="gradient" className="w-full" loading={enrollLoading} onClick={handleEnroll}>
                    {!enrollLoading && "Enroll now"}
                  </Button>
                )}

                <div className="space-y-2 pt-2 border-t border-border text-sm">
                  {[
                    { label: "Courses", value: courses.length },
                    { label: "Status",  value: <Badge variant={roadmap.status === "published" ? "success" : "secondary"} className="capitalize">{roadmap.status}</Badge> },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
