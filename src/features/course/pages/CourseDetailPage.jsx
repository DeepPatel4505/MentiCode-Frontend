// CourseDetailPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Zap, Users,
  CheckCircle2, Play, FileText, Paperclip, Lock,
  SkipForward, ArrowRight, Clock, BarChart2, Globe,
  Video, Infinity, Smartphone, Award, X, Sparkles, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Progress, Badge, Separator, Skeleton } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import { cn, getDifficultyConfig, formatDuration } from "@/lib/utils";
import api from "@/lib/api";
import useCourse from "@/features/course/hooks/useCourse";
import { useAuth } from "@/features/auth/hooks/useAuth";

const lessonIcons = { video: Play, article: FileText, attachment: Paperclip };

// ── Preview modal (pre-enrollment video player) ───────────────
function PreviewModal({ lesson, allPreviews, onSelect, onClose, onEnroll, isAuth }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const videoUrl = lesson?.videoUrl ?? "";
  const isYouTube = videoUrl.includes("youtube") || videoUrl.includes("youtu.be");
  const isVimeo   = videoUrl.includes("vimeo");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-xs">Preview</Badge>
            <span className="text-sm font-semibold truncate max-w-[300px]">{lesson?.title}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video */}
        <div className="aspect-video bg-black shrink-0">
          {isYouTube || isVimeo ? (
            <iframe src={videoUrl} className="w-full h-full" allowFullScreen allow="autoplay" />
          ) : videoUrl ? (
            <video src={videoUrl} controls autoPlay className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Preview list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 border-b border-border bg-card/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Preview lessons ({allPreviews.length})
            </p>
          </div>
          {allPreviews.map((p) => {
            const isCurrent = p.id === lesson?.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors border-b border-border/40 last:border-b-0",
                  isCurrent ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                  isCurrent ? "bg-primary/20" : "bg-background/60"
                )}>
                  <Play className={cn("w-3.5 h-3.5", isCurrent ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("block truncate", isCurrent ? "text-primary font-medium" : "text-foreground/80")}>
                    {p.title}
                  </span>
                  {p.duration > 0 && (
                    <span className="text-xs text-muted-foreground/60">{formatDuration(p.duration)}</span>
                  )}
                </div>
                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-4 py-3 border-t border-border bg-card/50 shrink-0">
          <Button variant="gradient" className="w-full gap-2" onClick={() => { onClose(); onEnroll(); }}>
            {isAuth ? <>Enroll now — it's free <ArrowRight className="w-4 h-4" /></> : <>Get started free <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Section row (course content accordion) ────────────────────
function SectionRow({ section, courseSlug, enrollment, progress, freeUpToLesson, freeUpToLevel, isPro, onSkip, isActive, onPreview, onGenerateNext }) {
  const [open, setOpen] = useState(isActive ?? false);
  const [generating, setGenerating] = useState(false);
  const completedLessons = new Set(progress?.lessonProgress?.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId) ?? []);
  const passedLevels     = new Set(progress?.levelAttempts?.filter((a)  => a.isPassed).map((a)  => a.levelId) ?? []);
  const isEnrolled = !!enrollment;

  const totalItems = (section.lessons?.length ?? 0) + (section.levels?.length ?? 0);
  const doneItems  = [...section.lessons ?? []].filter((l) => completedLessons.has(l.id)).length +
                     [...section.levels  ?? []].filter((lv) => passedLevels.has(lv.id)).length;
  const pct     = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const allDone = totalItems > 0 && doneItems === totalItems;

  // total duration of section
  const sectionDuration = section.lessons?.reduce((s, l) => s + (l.duration ?? 0), 0) ?? 0;

  return (
    <div className={cn("border-b border-border last:border-b-0", allDone && "bg-green-500/5")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors text-left gap-3"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            allDone ? "bg-green-500/20" :
            section.type === "challenge_section" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}>
            {allDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : section.order}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("font-semibold text-sm truncate", allDone ? "text-green-400" : "text-foreground")}>
              {section.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalItems} {totalItems === 1 ? "item" : "items"}
              {sectionDuration > 0 && ` · ${formatDuration(sectionDuration)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isEnrolled && pct > 0 && !allDone && <span className="text-xs font-semibold text-primary">{pct}%</span>}
          {allDone && <span className="text-xs font-semibold text-green-400">Done</span>}
          {section.isSkippable && isEnrolled && (
            <button
              onClick={(e) => { e.stopPropagation(); onSkip(section.id); }}
              className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-accent"
            >
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </button>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="bg-secondary/20 divide-y divide-border/40">
          {isEnrolled ? (
            <>
              {section.lessons?.map((lesson) => {
                const Icon = lessonIcons[lesson.type] ?? Play;
                const done = completedLessons.has(lesson.id);
                const free = freeUpToLesson === null || lesson.order <= freeUpToLesson;
                const canAccess = free || isPro;
                return (
                  <div key={lesson.id} className={cn("flex items-center gap-3 px-5 py-3 text-sm", canAccess && "hover:bg-accent/30 transition-colors")}>
                    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", done ? "bg-green-500/20" : "bg-background/60")}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {canAccess
                        ? <Link to={`/courses/${courseSlug}/lessons/${lesson.id}`} className="hover:text-primary transition-colors truncate block">{lesson.title}</Link>
                        : <span className="text-muted-foreground truncate block">{lesson.title}</span>
                      }
                      {lesson.duration > 0 && <p className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</p>}
                    </div>
                    {!canAccess && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  </div>
                );
              })}
              {section.levels?.map((level) => {
                const done = passedLevels.has(level.id);
                const free = freeUpToLevel === null || level.order <= freeUpToLevel;
                const canAccess = free || isPro;
                return (
                  <div key={level.id} className={cn("flex items-center gap-3 px-5 py-3 text-sm", canAccess && "hover:bg-accent/30 transition-colors")}>
                    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", done ? "bg-green-500/20" : "bg-primary/10")}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Zap className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {canAccess
                        ? <Link to={`/courses/${courseSlug}/levels/${level.id}`} className="hover:text-primary transition-colors truncate block">{level.title}</Link>
                        : <span className="text-muted-foreground truncate block">{level.title}</span>
                      }
                      <p className="text-xs text-muted-foreground capitalize">{level.type?.replace("_", " ")} · {level.xpReward} XP</p>
                    </div>
                    {!canAccess && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  </div>
                );
              })}
              {/* Generate next AI challenge — shown when enrolled, regardless of static level count */}
              {(allDone || totalItems === 0) && (
                <div className="px-5 py-3 border-t border-border/40">
                  <button
                    onClick={async () => {
                      if (generating) return;
                      setGenerating(true);
                      try {
                        const res = await api.post(`/sections/${section.id}/levels/generate-next`);
                        const level = res.data.data.level;
                        onGenerateNext?.(level);
                      } catch (err) {
                        // surface error via parent toast — just re-throw
                        throw err;
                      } finally {
                        setGenerating(false);
                      }
                    }}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {generating
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating challenge…</>
                      : <><Sparkles className="w-4 h-4" /> Generate next challenge</>
                    }
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Pre-enrollment: only show preview video lessons */}
              {section.lessons?.filter((l) => l.isPreview && l.type === "video").map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => onPreview?.(lesson)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-accent/30 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary/10">
                    <Play className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="hover:text-primary transition-colors truncate block">{lesson.title}</span>
                    {lesson.duration > 0 && <p className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</p>}
                  </div>
                  <Badge variant="success" className="text-xs shrink-0">Preview</Badge>
                </button>
              ))}
              {/* Locked summary row */}
              {(() => {
                const lockedCount =
                  (section.lessons?.filter((l) => !l.isPreview || l.type !== "video").length ?? 0) +
                  (section.levels?.length ?? 0);
                if (lockedCount === 0) return null;
                return (
                  <div className="flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground/60">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-background/40">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span>{lockedCount} more {lockedCount === 1 ? "lesson" : "lessons"} — enroll to unlock</span>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { user } = useAuth();
  const {
    currentCourse: course,
    coursesLoading: loading,
    enrollment,
    courseProgress: progress,
    enrollLoading,
    fetchCourseBySlug,
    fetchEnrollment,
    fetchCourseProgress,
    enrollInCourse,
    skipSection,
  } = useCourse();
  const isAuth = !!user;
  const isPro = user?.plan === "pro";
  const [showAllSections, setShowAllSections] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);

  const allPreviewLessons = course?.sections?.flatMap(
    (s) => s.lessons?.filter((l) => l.isPreview && l.type === "video") ?? []
  ) ?? [];

  const openPreview = useCallback((lesson) => setPreviewLesson(lesson), []);
  const closePreview = useCallback(() => setPreviewLesson(null), []);

  useEffect(() => { fetchCourseBySlug(slug); }, [fetchCourseBySlug, slug]);

  useEffect(() => {
    if (course?.id && isAuth) {
      fetchEnrollment(course.id);
      fetchCourseProgress(course.id);
    }
  }, [course?.id, fetchCourseProgress, fetchEnrollment, isAuth]);

  // ── Auto-redirect enrolled users to their current lesson ──
  useEffect(() => {
    if (!enrollment || !progress || !course) return;
    const currentLessonId = progress?.courseProgress?.currentLessonId;
    if (currentLessonId) {
      navigate(`/courses/${slug}/lessons/${currentLessonId}`, { replace: true });
    }
  }, [enrollment, progress, course, slug, navigate]);

  const handleEnroll = async () => {
    if (!isAuth) { navigate("/register"); return; }
    const res = await enrollInCourse(course.id);
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Enrolled!", description: "Start learning now.", type: "success" });
    } else {
      if (res.payload?.includes("Pro")) navigate("/pricing");
      else toast({ title: "Error", description: res.payload, type: "error" });
    }
  };

  const handleSkip = async (sectionId) => {
    const res = await skipSection({ courseId: course.id, sectionId });
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Section skipped", type: "info" });
  };

  if (loading || !course) return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="bg-secondary/30 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );

  const diff       = getDifficultyConfig(course.difficulty);
  const isEnrolled = !!enrollment;
  const overallPct = Math.round((progress?.courseProgress?.overallProgress ?? 0) * 100);

  // Pre-enrollment aggregates
  const totalLessons  = course.sections?.reduce((s, sec) => s + (sec.lessons?.length ?? 0), 0) ?? 0;
  const totalLevels   = course.sections?.reduce((s, sec) => s + (sec.levels?.length ?? 0), 0) ?? 0;
  const totalDuration = course.sections?.reduce((s, sec) =>
    s + (sec.lessons?.reduce((ls, l) => ls + (l.duration ?? 0), 0) ?? 0), 0) ?? 0;

  const visibleSections = showAllSections ? course.sections : course.sections?.slice(0, 4);

  // Course includes items
  const includes = [
    totalDuration > 0 && { icon: Video,    label: `${formatDuration(totalDuration)} on-demand video` },
    totalLevels   > 0 && { icon: Zap,      label: `${totalLevels} interactive challenge${totalLevels > 1 ? "s" : ""}` },
    { icon: Infinity,   label: "Full lifetime access" },
    { icon: Smartphone, label: "Access on mobile and desktop" },
    { icon: Award,      label: "Certificate of completion" },
  ].filter(Boolean);

  // ── Enrolled overview (shown when enrolled but no current lesson to redirect to yet) ──
  if (isEnrolled) {
    const completedCount = progress?.lessonProgress?.filter((lp) => lp.isCompleted).length ?? 0;
    const firstLesson = course.sections?.[0]?.lessons?.[0];
    return (
      <div className="min-h-screen bg-background">
        {/* Enrolled hero */}
        <div className="bg-gradient-to-b from-[#0f172a] to-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", diff.bg, diff.color)}>{diff.label}</span>
              {course.tags?.slice(0, 3).map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-white/70 border border-white/10">{t}</span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-6">
              {/* Progress */}
              <div className="flex-1 min-w-[200px] max-w-sm">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>{completedCount} of {totalLessons + totalLevels} complete</span>
                  <span className="font-semibold text-white">{overallPct}%</span>
                </div>
                <Progress value={overallPct} className="h-2" />
              </div>
              {firstLesson && (
                <Button variant="gradient" size="lg" className="gap-2 shrink-0" asChild>
                  <Link to={`/courses/${slug}/lessons/${firstLesson.id}`}>
                    {overallPct > 0 ? "Continue learning" : "Start learning"} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold">Course content</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {course.sections?.length ?? 0} sections · {totalLessons} lessons
            {totalLevels > 0 && ` · ${totalLevels} challenges`}
            {totalDuration > 0 && ` · ${formatDuration(totalDuration)} total`}
          </p>
          <div className="rounded-2xl border border-border overflow-hidden">
            {(showAllSections ? course.sections : course.sections?.slice(0, 6))?.map((s) => (
              <SectionRow
                key={s.id} section={s} courseSlug={slug}
                enrollment={enrollment} progress={progress}
                freeUpToLesson={course.freeUpToLesson} freeUpToLevel={course.freeUpToLevel}
                isPro={isPro} onSkip={handleSkip}
                isActive={s.id === (progress?.courseProgress?.currentSectionId ?? course.sections?.[0]?.id)}
                onGenerateNext={(level) => navigate(`/courses/${slug}/levels/${level.id}`)}
              />
            ))}
          </div>
          {(course.sections?.length ?? 0) > 6 && (
            <button
              onClick={() => setShowAllSections((v) => !v)}
              className="mt-3 text-sm text-primary hover:underline font-medium flex items-center gap-1"
            >
              {showAllSections
                ? <><ChevronDown className="w-4 h-4 rotate-180" /> Show less</>
                : <><ChevronDown className="w-4 h-4" /> Show {course.sections.length - 6} more sections</>
              }
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview modal */}
      {previewLesson && (
        <PreviewModal
          lesson={previewLesson}
          allPreviews={allPreviewLessons}
          onSelect={setPreviewLesson}
          onClose={closePreview}
          onEnroll={handleEnroll}
          isAuth={isAuth}
        />
      )}
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-b from-[#0f172a] to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: course info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Breadcrumb tags */}
              <div className="flex flex-wrap gap-2">
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", diff.bg, diff.color)}>
                  {diff.label}
                </span>
                {course.tags?.slice(0, 3).map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-white/70 border border-white/10">{t}</span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{course.title}</h1>

              {/* Description excerpt */}
              {course.description && (
                <p className="text-white/70 text-base leading-relaxed line-clamp-3">{course.description}</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {course.totalXp > 0 && (
                  <span className="flex items-center gap-1.5 text-primary font-semibold">
                    <Zap className="w-4 h-4" /> {course.totalXp} XP
                  </span>
                )}
                {course._count?.enrollments > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {course._count.enrollments.toLocaleString()} students
                  </span>
                )}
                {totalLessons > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Play className="w-4 h-4" /> {totalLessons} lessons
                  </span>
                )}
                {totalDuration > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {formatDuration(totalDuration)}
                  </span>
                )}
                {course.language && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> {course.language.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Right: sticky enroll card (desktop only in hero) */}
            <div className="hidden lg:block">
              <EnrollCard
                course={course}
                slug={slug}
                isAuth={isAuth}
                isEnrolled={isEnrolled}
                isPro={isPro}
                enrollLoading={enrollLoading}
                progress={progress}
                overallPct={overallPct}
                diff={diff}
                includes={includes}
                onEnroll={handleEnroll}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mobile enroll card */}
            <div className="lg:hidden">
              <EnrollCard
                course={course}
                slug={slug}
                isAuth={isAuth}
                isEnrolled={isEnrolled}
                isPro={isPro}
                enrollLoading={enrollLoading}
                progress={progress}
                overallPct={overallPct}
                diff={diff}
                includes={includes}
                onEnroll={handleEnroll}
              />
            </div>

            {/* Progress (enrolled) */}
            {isEnrolled && overallPct > 0 && (
              <Card className="p-5 border-primary/20 bg-primary/5">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-semibold">Your progress</span>
                  <span className="font-bold text-primary">{overallPct}%</span>
                </div>
                <Progress value={overallPct} className="h-2.5" color={overallPct === 100 ? "bg-emerald-500" : undefined} />
                {overallPct === 100 && (
                  <p className="text-xs text-green-400 font-medium mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Course completed!
                  </p>
                )}
              </Card>
            )}

            {/* What you'll learn */}
            {course.description && !isEnrolled && (
              <div>
                <h2 className="text-xl font-bold mb-4">About this course</h2>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              </div>
            )}

            {/* Course content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold">Course content</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {course.sections?.length ?? 0} sections · {totalLessons} lessons
                {totalLevels > 0 && ` · ${totalLevels} challenges`}
                {totalDuration > 0 && ` · ${formatDuration(totalDuration)} total`}
              </p>

              <div className="rounded-2xl border border-border overflow-hidden">
                {visibleSections?.map((s) => (
                  <SectionRow
                    key={s.id}
                    section={s}
                    courseSlug={slug}
                    enrollment={enrollment}
                    progress={progress}
                    freeUpToLesson={course.freeUpToLesson}
                    freeUpToLevel={course.freeUpToLevel}
                    isPro={isPro}
                    onSkip={handleSkip}
                    onPreview={openPreview}
                    isActive={s.id === (progress?.courseProgress?.currentSectionId ?? course.sections?.[0]?.id)}
                    onGenerateNext={(level) => navigate(`/courses/${slug}/levels/${level.id}`)}
                  />
                ))}
              </div>

              {(course.sections?.length ?? 0) > 4 && (
                <button
                  onClick={() => setShowAllSections((v) => !v)}
                  className="mt-3 text-sm text-primary hover:underline font-medium flex items-center gap-1"
                >
                  {showAllSections
                    ? <><ChevronDown className="w-4 h-4 rotate-180" /> Show less</>
                    : <><ChevronDown className="w-4 h-4" /> Show {course.sections.length - 4} more sections</>
                  }
                </button>
              )}
            </div>
          </div>

          {/* Desktop sticky sidebar (scrolls with page below hero) */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <CourseIncludesCard includes={includes} diff={diff} course={course} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Enroll card (used in hero on desktop, inline on mobile) ───
function EnrollCard({ course, slug, isAuth, isEnrolled, isPro, enrollLoading, progress, overallPct, diff, includes, onEnroll }) {
  return (
    <Card className="overflow-hidden shadow-2xl shadow-black/40 border-border/60">
      {course.thumbnail && (
        <div className="relative aspect-video overflow-hidden">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          {!isEnrolled && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </div>
      )}
      <CardContent className="p-5 space-y-4">
        {/* Access label */}
        {course.freeUpToLesson === null ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Free course
          </div>
        ) : course.freeUpToLesson === 0 ? (
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Lock className="w-4 h-4" /> Pro plan required
          </div>
        ) : (
          <div className="text-sm text-green-400 font-semibold">
            First {course.freeUpToLesson} lessons free
          </div>
        )}

        <Separator />

        {/* CTA */}
        {!isAuth ? (
          <Button variant="gradient" className="w-full gap-2" size="lg" asChild>
            <Link to="/register">Get started free <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        ) : isEnrolled ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-green-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Enrolled
            </div>
            {overallPct > 0 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progress</span><span className="font-semibold text-foreground">{overallPct}%</span>
                </div>
                <Progress value={overallPct} className="h-2" />
              </div>
            )}
            {progress?.courseProgress?.currentLessonId && (
              <Button variant="gradient" className="w-full gap-2" asChild>
                <Link to={`/courses/${slug}/lessons/${progress.courseProgress.currentLessonId}`}>
                  Continue learning <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="gradient" className="w-full gap-2" size="lg" loading={enrollLoading} onClick={onEnroll}>
              {!enrollLoading && (<>Enroll now — it's free <ArrowRight className="w-4 h-4" /></>)}
            </Button>
            {!isPro && course.freeUpToLesson === 0 && (
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link to="/pricing">Upgrade to Pro for full access</Link>
              </Button>
            )}
          </div>
        )}

        {/* Course includes */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">This course includes</p>
          {includes.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 shrink-0 text-primary/70" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <Separator />
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> {diff.label}</div>
          {course.language && <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {course.language.toUpperCase()}</div>}
          {course.sections?.length > 0 && <div className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> {course.sections.length} sections</div>}
          {course.totalXp > 0 && <div className="flex items-center gap-1.5 text-primary font-semibold"><Zap className="w-3.5 h-3.5" /> {course.totalXp} XP</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Slim includes card shown in body sidebar (desktop) ────────
function CourseIncludesCard({ includes, diff, course }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-3">
        <p className="text-sm font-semibold">Course includes</p>
        {includes.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Icon className="w-4 h-4 shrink-0 text-primary/70" />
            <span>{label}</span>
          </div>
        ))}
        <Separator />
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between"><span>Difficulty</span><span className="text-foreground font-medium">{diff.label}</span></div>
          {course.language && <div className="flex justify-between"><span>Language</span><span className="text-foreground font-medium">{course.language.toUpperCase()}</span></div>}
          {course.totalXp > 0 && <div className="flex justify-between"><span>XP reward</span><span className="text-primary font-semibold">{course.totalXp} XP</span></div>}
        </div>
      </CardContent>
    </Card>
  );
}
