import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  CheckCircle2, Zap, Play, FileText, X, PanelRight,
} from "lucide-react";
import CourseNavbar from "@/components/layout/CourseNavbar";
import { Button } from "@/components/ui/Button";
import { Progress, Skeleton } from "@/components/ui/index";
import {
  fetchCourseBySlug, fetchLesson, fetchMyCourses,
  selectCurrentCourse, selectCurrentLesson, selectLessonLoading,
} from "@/app/store/slices/courseSlice";
import {
  updateLessonProgress, fetchCourseProgress, selectCourseProgress,
} from "@/app/store/slices/enrollSlice";
import { fetchStreak } from "@/app/store/slices/gamificationSlice";
import { cn, formatDuration } from "@/lib/utils";

// ── Sidebar section ───────────────────────────────────────────
function SidebarSection({ section, lessonId, progress, onNavigate, justCompletedId }) {
  const completedLessons = new Set(
    progress?.lessonProgress?.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId) ?? []
  );
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

// ── Extract YouTube video ID from any YouTube URL ─────────────
function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
    if (u.pathname.includes("/embed/")) return u.pathname.split("/embed/")[1]?.split("?")[0];
    return u.searchParams.get("v") ?? null;
  } catch {
    return null;
  }
}

// ── YouTube thumbnail overlay player ─────────────────────────
// - Hides the YouTube red play button with a custom thumbnail + branded play button
// - Uses YT IFrame API to detect video end → auto-marks lesson complete
function YouTubeThumbnailPlayer({ embedUrl, videoId, lessonTitle, onEnded }) {
  const [started, setStarted] = useState(false);
  const playerContainerRef = useRef(null);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  // Reset overlay whenever the lesson changes
  useEffect(() => { setStarted(false); }, [embedUrl]);

  // Initialize YouTube IFrame API once user clicks play
  useEffect(() => {
    if (!started || !videoId) return;

    const initPlayer = () => {
      if (!playerContainerRef.current) return;
      new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          controls: 1,
          showinfo: 0,
          color: "white", // white progress bar instead of red
        },
        events: {
          onStateChange: (e) => {
            // YT.PlayerState.ENDED === 0
            if (e.data === window.YT.PlayerState.ENDED) {
              onEnded?.();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      // Load the YT IFrame API script only once
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [started, videoId]);

  // ── Before play: custom thumbnail + branded play button ─────
  if (!started) {
    return (
      <div
        className="w-full h-full relative cursor-pointer group"
        onClick={() => setStarted(true)}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={lessonTitle ?? "Video thumbnail"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if maxresdefault not available
              e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}

        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

        {/* Custom play button — your brand color, no YouTube red */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-2xl">
            <Play className="w-7 h-7 text-white ml-1 fill-white" />
          </div>
        </div>
      </div>
    );
  }

  // ── After play: YT IFrame API player + bottom bar cover ─────
  return (
    <div className="w-full h-full relative">
      {/* YT IFrame API replaces this div with the actual iframe */}
      <div ref={playerContainerRef} className="w-full h-full" />
      {/* Covers "More videos", YouTube logo, share/copy-URL button */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black pointer-events-none" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function LessonPlayerPage() {
  const { slug, lessonId } = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const course   = useSelector(selectCurrentCourse);
  const lesson   = useSelector(selectCurrentLesson);
  const loading  = useSelector(selectLessonLoading);
  const progress = useSelector(selectCourseProgress);

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
      dispatch(updateLessonProgress({ lessonId, watchedUpTo: currentTime, isCompleted: false }));
    }, 5000);
  }, [dispatch]);

  useEffect(() => {
    if (!course) dispatch(fetchCourseBySlug(slug));
    dispatch(fetchLesson(lessonId));
    currentTimeRef.current = 0;
    return () => {
      clearTimeout(saveTimerRef.current);
      if (currentTimeRef.current > 0) {
        dispatch(updateLessonProgress({ lessonId, watchedUpTo: currentTimeRef.current, isCompleted: false }));
      }
    };
  }, [dispatch, slug, lessonId]);

  useEffect(() => {
    if (course?.id) dispatch(fetchCourseProgress(course.id));
  }, [dispatch, course?.id]);

  // Flat list of all items for prev/next navigation
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
    if (currentTime > 0) debouncedSaveProgress(lessonId, currentTime);
  };

  const handleComplete = (watchedUpTo) => {
    if (completed) return;
    setCompleted(true);
    const payload = { lessonId, isCompleted: true };
    if (watchedUpTo != null && watchedUpTo > 0) payload.watchedUpTo = watchedUpTo;
    dispatch(updateLessonProgress(payload))
      .then(() => {
        if (course?.id) dispatch(fetchCourseProgress(course.id));
        dispatch(fetchMyCourses());
        dispatch(fetchStreak());
      });
  };

  const normalizeEmbedUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();

    const withCleanEmbedParams = (embedUrl) => {
      try {
        const parsed = new URL(embedUrl);
        parsed.searchParams.set("rel", "0");
        parsed.searchParams.set("modestbranding", "1");
        parsed.searchParams.set("playsinline", "1");
        parsed.searchParams.set("iv_load_policy", "3");
        parsed.searchParams.set("controls", "1");
        parsed.searchParams.set("showinfo", "0");
        parsed.searchParams.set("color", "white"); // white progress bar, no red
        return parsed.toString();
      } catch {
        return embedUrl;
      }
    };

    if (trimmed.includes("youtube.com/watch")) {
      try {
        const parsed = new URL(trimmed);
        const videoId = parsed.searchParams.get("v");
        if (videoId) return withCleanEmbedParams(`https://www.youtube-nocookie.com/embed/${videoId}`);
      } catch {
        return trimmed;
      }
    }

    if (trimmed.includes("youtu.be/")) {
      const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) return withCleanEmbedParams(`https://www.youtube-nocookie.com/embed/${videoId}`);
    }

    if (trimmed.includes("youtube.com/embed/")) {
      return withCleanEmbedParams(trimmed.replace("youtube.com/embed/", "youtube-nocookie.com/embed/"));
    }

    return trimmed;
  };

  const embedUrl = normalizeEmbedUrl(lesson?.videoUrl ?? "");
  const isEmbeddedProvider = embedUrl.includes("youtube") || embedUrl.includes("vimeo");
  const isYouTubeEmbed = embedUrl.includes("youtube") || embedUrl.includes("youtu.be");
  const youTubeVideoId = isYouTubeEmbed ? extractYouTubeId(lesson?.videoUrl ?? "") : null;

  const existingProgress = progress?.lessonProgress?.find((lp) => lp.lessonId === lessonId);
  const isDone = completed || !!existingProgress?.isCompleted;
  const overallPct = Math.round((progress?.courseProgress?.overallProgress ?? 0) * 100);
  const completedCount = progress?.lessonProgress?.filter((lp) => lp.isCompleted).length ?? 0;
  const totalCount = allItems.length;

  // Full-page skeleton only on the very first load (no data at all yet)
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
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <p className="text-sm font-semibold text-foreground">
          {completedCount} of {totalCount} complete
        </p>
        <Progress value={overallPct} className="h-1.5 mt-2" />
      </div>
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Course navbar ── */}
      <CourseNavbar courseTitle={course?.title} courseSlug={slug} />

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

          {/* ── Video area ── */}
          {loading && !lesson ? (
            <Skeleton className="aspect-video w-full shrink-0" />
          ) : loading ? (
            <div className="aspect-video bg-black w-full shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : lesson?.type === "video" ? (
            isEmbeddedProvider
              ? (
                // ── YouTube / Vimeo embed ────────────────────────────
                <div className="aspect-video bg-black w-full shrink-0 overflow-hidden">
                  {isYouTubeEmbed ? (
                    // Thumbnail overlay hides YouTube red play button.
                    // YT IFrame API fires onEnded to auto-complete the lesson.
                    <YouTubeThumbnailPlayer
                      embedUrl={embedUrl}
                      videoId={youTubeVideoId}
                      lessonTitle={lesson?.title}
                      onEnded={() => handleComplete(null)}
                    />
                  ) : (
                    // Vimeo or other — plain iframe
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  )}
                </div>
              )
              : lesson.videoUrl
                ? (
                  // ── Self-hosted video ──────────────────────────────
                  <div className="aspect-video bg-black w-full shrink-0">
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
                )
                : (
                  <div className="aspect-video bg-secondary w-full shrink-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                    <Play className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Video URL is missing for this lesson.</p>
                  </div>
                )
          ) : null}

          {/* ── Article ── */}
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

          {/* ── Title + meta + actions ── */}
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

            {/* Mark complete button (articles / manual) */}
            {!isDone && !loading && lesson?.type !== "video" && (
              <Button variant="gradient" onClick={handleComplete} className="gap-2">
                <CheckCircle2 className="w-4 h-4" /> Mark as complete
              </Button>
            )}

            {/* Prev / Next */}
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