import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  CheckCircle2, Zap, Play, FileText, X, PanelRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Progress, Skeleton } from "@/components/ui/index";
import { cn, formatDuration } from "@/lib/utils";
import useCourse from "@/features/course/hooks/useCourse";

// ── Sidebar section ───────────────────────────────────────────
function SidebarSection({ section, lessonId, progress, onNavigate, justCompletedId }) {
  const completedLessons = new Set(
    progress?.lessonProgress?.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId) ?? []
  );
  // Optimistically mark the just-completed lesson without waiting for re-fetch
  if (justCompletedId) completedLessons.add(justCompletedId);
  const passedLevels = new Set(
    progress?.levelAttempts?.filter((a) => a.isPassed).map((a) => a.levelId) ?? []
  );

  const hasCurrentItem =
    section.lessons?.some((l) => l.id === lessonId) ||
    section.levels?.some((lv) => lv.id === lessonId);

  const [open, setOpen] = useState(hasCurrentItem);

  const totalItems = (section.lessons?.length ?? 0) + (section.levels?.length ?? 0);
  const doneItems =
    (section.lessons?.filter((l) => completedLessons.has(l.id)).length ?? 0) +
    (section.levels?.filter((lv) => passedLevels.has(lv.id)).length ?? 0);
  const allDone = totalItems > 0 && doneItems === totalItems;

  const sectionDuration = section.lessons?.reduce((s, l) => s + (l.duration ?? 0), 0) ?? 0;

  return (
    <div className={cn("border-b border-border/60 last:border-b-0", allDone && "bg-green-500/5")}>
      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-start gap-2 px-4 py-3 hover:bg-accent/40 transition-colors text-left",
          hasCurrentItem && !allDone && "bg-primary/5"
        )}
      >
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform",
          open && "rotate-180"
        )} />
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-semibold leading-snug",
            allDone ? "text-green-400" : "text-foreground"
          )}>
            {section.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doneItems}/{totalItems}
            {sectionDuration > 0 && ` · ${formatDuration(sectionDuration)}`}
          </p>
        </div>
        {allDone && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
      </button>

      {/* Items */}
      {open && (
        <div className="bg-background/40">
          {section.lessons?.map((lesson) => {
            const isCurrent = lesson.id === lessonId;
            const isDone = completedLessons.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => onNavigate({ type: "lesson", id: lesson.id })}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors border-t border-border/30",
                  isCurrent
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5",
                  isDone ? "text-green-400" : isCurrent ? "text-primary" : "text-muted-foreground/50"
                )}>
                  {isDone
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <Play className="w-3.5 h-3.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block leading-snug",
                    isCurrent ? "text-primary font-medium" : isDone ? "text-muted-foreground" : "text-foreground/80"
                  )}>
                    {lesson.title}
                  </span>
                  {lesson.duration > 0 && (
                    <span className="text-xs text-muted-foreground/60">{formatDuration(lesson.duration)}</span>
                  )}
                </div>
              </button>
            );
          })}
          {section.levels?.map((level) => {
            const isCurrent = level.id === lessonId;
            const isDone = passedLevels.has(level.id);
            return (
              <button
                key={level.id}
                onClick={() => onNavigate({ type: "level", id: level.id })}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors border-t border-border/30",
                  isCurrent
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5",
                  isDone ? "text-green-400" : "text-primary/70"
                )}>
                  {isDone
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <Zap className="w-3.5 h-3.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block leading-snug",
                    isCurrent ? "text-primary font-medium" : isDone ? "text-muted-foreground" : "text-foreground/80"
                  )}>
                    {level.title}
                  </span>
                  <span className="text-xs text-muted-foreground/60 capitalize">
                    {level.type?.replace("_", " ")} · {level.xpReward} XP
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function LessonPlayerPage() {
  const { slug, lessonId } = useParams();
  const navigate  = useNavigate();
  const {
    currentCourse: course,
    currentLesson: lesson,
    lessonLoading: loading,
    courseProgress: progress,
    fetchCourseBySlug,
    fetchLesson,
    fetchMyCourses,
    fetchCourseProgress,
    updateLessonProgress,
    fetchStreak,
  } = useCourse();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const currentTimeRef = useRef(0);
  const saveTimerRef = useRef(null);

  useEffect(() => { setCompleted(false); }, [lessonId]);

  // Debounced progress save — fires at most once per 5 seconds
  const debouncedSaveProgress = useCallback((lessonId, currentTime) => {
    if (currentTime <= 0) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateLessonProgress({ lessonId, watchedUpTo: currentTime, isCompleted: false });
    }, 5000);
  }, [updateLessonProgress]);

  useEffect(() => {
    if (!course) fetchCourseBySlug(slug);
    fetchLesson(lessonId);
    currentTimeRef.current = 0;
    return () => {
      clearTimeout(saveTimerRef.current);
      // Only save progress if the user actually watched something
      if (currentTimeRef.current > 0) {
        updateLessonProgress({ lessonId, watchedUpTo: currentTimeRef.current, isCompleted: false });
      }
    };
  }, [course, fetchCourseBySlug, fetchLesson, lessonId, slug, updateLessonProgress]);

  useEffect(() => {
    if (course?.id) fetchCourseProgress(course.id);
  }, [course?.id, fetchCourseProgress]);

  // Flat list for prev/next
  const allItems = [];
  course?.sections?.forEach((s) => {
    s.lessons?.forEach((l) => allItems.push({ type: "lesson", id: l.id }));
    s.levels?.forEach((lv) => allItems.push({ type: "level", id: lv.id }));
  });
  const currentIdx = allItems.findIndex((i) => i.id === lessonId);
  const prev = allItems[currentIdx - 1];
  const next = allItems[currentIdx + 1];

  const goTo = (item) => {
    if (!item) return;
    navigate(item.type === "lesson"
      ? `/courses/${slug}/lessons/${item.id}`
      : `/courses/${slug}/levels/${item.id}`
    );
  };

  const handleVideoPause = (currentTime) => {
    if (currentTime > 0) {
      debouncedSaveProgress(lessonId, currentTime);
    }
  };

  const handleComplete = (watchedUpTo) => {
    if (completed) return;
    setCompleted(true);
    const payload = { lessonId, isCompleted: true };
    if (watchedUpTo != null && watchedUpTo > 0) payload.watchedUpTo = watchedUpTo;
    updateLessonProgress(payload)
      .then(() => {
        if (course?.id) fetchCourseProgress(course.id);
        fetchMyCourses();
        fetchStreak();
      });
  };

  const existingProgress = progress?.lessonProgress?.find((lp) => lp.lessonId === lessonId);
  const isDone = completed || !!existingProgress?.isCompleted;
  const overallPct = Math.round((progress?.courseProgress?.overallProgress ?? 0) * 100);
  const completedCount = progress?.lessonProgress?.filter((lp) => lp.isCompleted).length ?? 0;
  const totalCount = allItems.length;

  // Only show full-page skeleton on the very first load (no course data yet).
  // On lesson navigation, keep the full layout and show a video-area spinner only.
  const isInitialLoad = !course && !lesson;

  if (isInitialLoad) return (
    <div className="h-screen bg-background flex flex-col">
      <div className="h-14 border-b border-border bg-card" />
      <div className="h-11 border-b border-border bg-background" />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-7 w-1/2" />
        </div>
        <div className="hidden lg:block w-96 border-l border-border" />
      </div>
    </div>
  );

  // ── Sidebar content (shared between desktop + mobile) ────────
  const SidebarContent = () => (
    <>
      {/* Progress header */}
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <p className="text-sm font-semibold text-foreground">
          {completedCount} of {totalCount} complete
        </p>
        <Progress value={overallPct} className="h-1.5 mt-2" />
      </div>
      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        {course?.sections?.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            lessonId={lessonId}
            progress={progress}
            justCompletedId={completed ? lessonId : null}
            onNavigate={(item) => {
              goTo(item);
              setMobileSidebarOpen(false);
            }}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="h-full min-h-0 bg-background flex flex-col overflow-hidden">

      {/* ── Lesson controls bar ── */}
      <div className="h-11 shrink-0 border-b border-border bg-background flex items-center px-4 gap-3 z-30">
        <div className="flex-1 hidden sm:flex items-center gap-3 min-w-0">
          <Progress value={overallPct} className="h-1.5 max-w-xs" />
          <span className="text-xs text-muted-foreground shrink-0">{overallPct}%</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => goTo(prev)}
            disabled={!prev}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goTo(next)}
            disabled={!next}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body: video + sidebar ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video / loading state */}
          {loading && !lesson ? (
            <Skeleton className="aspect-video w-full shrink-0" />
          ) : loading ? (
            <div className="aspect-video bg-black w-full shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : lesson?.type === "video" ? (
            lesson.videoUrl?.includes("youtube") || lesson.videoUrl?.includes("vimeo")
              ? <div className="aspect-video bg-black w-full shrink-0">
                  <iframe src={lesson.videoUrl} className="w-full h-full" allowFullScreen />
                </div>
              : lesson.videoUrl
                ? <div className="aspect-video bg-black w-full shrink-0">
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="w-full h-full"
                      onTimeUpdate={(e) => { currentTimeRef.current = Math.floor(e.target.currentTime); }}
                      onPause={(e) => handleVideoPause(Math.floor(e.target.currentTime))}
                      onSeeked={(e) => {
                        const t = Math.floor(e.target.currentTime);
                        currentTimeRef.current = t;
                        debouncedSaveProgress(lessonId, t);
                      }}
                      onEnded={(e) => handleComplete(Math.floor(e.target.duration ?? 0))}
                    />
                  </div>
                : <div className="aspect-video bg-secondary w-full shrink-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground/30" />
                  </div>
          ) : null}

          {/* Article */}
          {!loading && lesson?.type === "article" && (
            <div className="m-6 rounded-2xl border border-border bg-card p-6 min-h-48">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
                <FileText className="w-4 h-4" /> Article
              </div>
              <div
                className="prose prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.body || "<p>Content coming soon.</p>" }}
              />
            </div>
          )}

          {/* Title + meta + actions */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {loading
                  ? <><Skeleton className="h-6 w-64 mb-2" /><Skeleton className="h-4 w-24" /></>
                  : <>
                      <h1 className="text-xl font-bold leading-snug">{lesson?.title}</h1>
                      {lesson?.duration > 0 && (
                        <p className="text-muted-foreground text-sm mt-1">{formatDuration(lesson.duration)}</p>
                      )}
                    </>
                }
              </div>
              {isDone && (
                <div className="flex items-center gap-1.5 text-green-400 text-sm font-semibold shrink-0 mt-1">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </div>
              )}
            </div>

            {/* Mark complete (non-video or manual) */}
            {!isDone && !loading && lesson?.type !== "video" && (
              <Button variant="gradient" onClick={handleComplete} className="gap-2">
                <CheckCircle2 className="w-4 h-4" /> Mark as complete
              </Button>
            )}

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => goTo(prev)} disabled={!prev} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant={isDone ? "gradient" : "secondary"}
                onClick={() => goTo(next)}
                disabled={!next}
                className="gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Desktop sidebar (always visible) ── */}
        <div className="hidden lg:flex flex-col w-96 xl:w-[420px] shrink-0 border-l border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <h2 className="font-semibold text-sm">Course content</h2>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="w-96 bg-card border-l border-border flex flex-col animate-slide-right">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="font-semibold text-sm">Course content</h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
}
