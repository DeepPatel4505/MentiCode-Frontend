import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Code2, Zap, Lock, Users,
  BookOpen, ChevronRight, ChevronLeft, X,
} from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/index";
import { selectIsAuth, selectIsPro } from "@/app/store/slices/authSlice";
import { useSelector } from "react-redux";
import { cn, getDifficultyConfig } from "@/lib/utils";
import api from "@/lib/axios";



// ── Course card ───────────────────────────────────────────────
function CourseCard({ course, isPro }) {
  const diff = getDifficultyConfig(course.difficulty);
  return (
    <Link to={`/courses/${course.slug}`} className="group block h-full">
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-blue-900/20 relative overflow-hidden shrink-0">
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center"><Code2 className="w-8 h-8 text-primary/20" /></div>
          }
          <div className="absolute top-2 left-2 flex gap-1">
            {course.freeUpToLesson === null && (
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-green-500/90 text-white">Free</span>
            )}
            {course.freeUpToLesson === 0 && !isPro && (
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-primary/90 text-white flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> Pro
              </span>
            )}
          </div>
          {course.totalXp > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-xs font-bold text-primary">
              <Zap className="w-3 h-3" /> {course.totalXp}
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{course.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-auto">
            <span className={cn("px-1.5 py-0.5 rounded border text-xs font-medium", diff.bg, diff.color)}>
              {diff.label}
            </span>
            {course._count?.enrollments > 0 && (
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" /> {course._count.enrollments.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Tag section — only fetches when scrolled into view ────────
function CourseRow({ tag, isPro, onTagClick }) {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetched,  setFetched]  = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const rowRef       = useRef(null);
  const timerRef     = useRef(null);

  const fetchCourses = useCallback(() => {
    if (fetched || loading) return;
    setLoading(true);
    setProgress(0);

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) { clearInterval(timerRef.current); return p; }
        return p + Math.random() * 12;
      });
    }, 180);

    api.get("/courses", { params: { status: "published", tags: tag, limit: 10 } })
      .then((r) => {
        clearInterval(timerRef.current);
        setProgress(100);
        // Show all courses that belong to this tag — no deduplication
        const all = r.data.data.courses ?? [];
        setCourses(all);
      })
      .catch(() => { clearInterval(timerRef.current); setProgress(100); })
      .finally(() => {
        setFetched(true);
        setTimeout(() => setLoading(false), 300);
      });
  }, [tag, fetched, loading]);

  // Only fetch when this row enters the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { fetchCourses(); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchCourses]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 500, behavior: "smooth" });
  };

  // Reserve space even before fetch so the observer fires correctly
  return (
    <div ref={containerRef} className="mb-12 min-h-[220px]">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold capitalize">{tag}</h2>
        <button
          onClick={() => onTagClick(tag)}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Show all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="h-0.5 w-full bg-border rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      {/* Cards */}
      {(!fetched || loading) ? (
        // Skeleton placeholders while loading
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:overflow-visible">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[200px] lg:min-w-0 flex-shrink-0 lg:flex-shrink space-y-2">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? null : (
        <div className="relative group/row">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-card border border-border shadow-md hidden lg:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={rowRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:overflow-visible"
          >
            {courses.map((c) => (
              <div key={c.id} className="min-w-[200px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                <CourseCard course={c} isPro={isPro} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-card border border-border shadow-md hidden lg:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-accent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Infinite scroll grid (search / tag filter mode) ───────────
function InfiniteGrid({ query, tag, isPro }) {
  const [courses, setCourses] = useState([]);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setCourses([]);
    setPage(1);
    setHasMore(true);
    isFirstRender.current = true;
  }, [query, tag]);

  useEffect(() => {
    if (!hasMore && !isFirstRender.current) return;
    isFirstRender.current = false;
    setLoading(true);
    const params = { status: "published", page, limit: 12 };
    if (query) params.search = query;
    if (tag)   params.tags   = tag;
    api.get("/courses", { params })
      .then((r) => {
        const data = r.data.data;
        setCourses((prev) => page === 1 ? (data.courses ?? []) : [...prev, ...(data.courses ?? [])]);
        setHasMore(data.pagination?.hasNext ?? false);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, [query, tag, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading && hasMore) setPage((p) => p + 1); },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, hasMore]);

  if (!loading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <BookOpen className="w-14 h-14 text-muted-foreground/20" />
        <p className="text-lg font-semibold">No courses found</p>
        <p className="text-sm text-muted-foreground">Try a different search or tag</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {courses.map((c) => <CourseCard key={c.id} course={c} isPro={isPro} />)}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={`sk-${i}`} className="space-y-2">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="h-4 mt-4" />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CoursesPage() {
  const isPro   = useSelector(selectIsPro);
  const isAuth  = useSelector(selectIsAuth);

  const [search,    setSearch]    = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [pillTags,  setPillTags]  = useState([]);   // pill bar — updates as pages come in
  const [rowTags,   setRowTags]   = useState([]);   // frozen after page 1 — drives CourseRow mounts
  const [tagsReady, setTagsReady] = useState(false);
  const [debounced, setDebounced] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Lazily paginate to discover tags.
  // Page 1 → freeze rowTags (drives CourseRow mounts, never changes again).
  // Subsequent pages → only update pillTags (pill bar only, no remounts).
  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      const tagSet = new Set();
      let page = 1;
      let hasNext = true;

      while (hasNext && !cancelled) {
        try {
          const r = await api.get("/courses", { params: { status: "published", page, limit: 10 } });
          const data = r.data.data;
          (data.courses ?? []).forEach((c) => (c.tags ?? []).forEach((t) => tagSet.add(t)));
          const snapshot = [...tagSet];

          if (!cancelled) {
            setPillTags(snapshot);
            if (page === 1) {
              // Freeze the row list — never update again to avoid remounting rows
              setRowTags(snapshot);
              setTagsReady(true);
            }
          }

          hasNext = data.pagination?.hasNext ?? false;
          page += 1;
        } catch {
          break;
        }
      }

      if (!cancelled) setTagsReady(true);
    }

    loadTags();
    return () => { cancelled = true; };
  }, []);

  const isFiltering = !!debounced || !!activeTag;
  const clearFilters = () => { setSearch(""); setActiveTag(""); setDebounced(""); };

  return (
    <Shell fullWidth className="!p-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
              Learn to code.<br />
              <span className="text-primary">Level up fast.</span>
            </h1>
            <p className="text-white/60 text-base mb-8">
              Hands-on courses with interactive challenges, XP rewards, and real projects.
            </p>
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search for anything…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              {search && (
                <button onClick={clearFilters} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tag pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {!tagsReady ? (
            // Skeleton pills while tags load
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 rounded-full bg-card border border-border shrink-0" style={{ width: `${60 + i * 15}px` }} />
            ))
          ) : (
            <>
              <button
                onClick={() => setActiveTag("")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all shrink-0",
                  !activeTag
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                All
              </button>
              {pillTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all shrink-0 capitalize",
                    activeTag === tag
                      ? "bg-primary text-white border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Active filter label */}
        {isFiltering && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm text-muted-foreground">
              {debounced && <span>Results for <span className="text-foreground font-medium">"{debounced}"</span></span>}
              {debounced && activeTag && <span> · </span>}
              {activeTag && <span>Tag: <span className="text-foreground font-medium capitalize">{activeTag}</span></span>}
            </p>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
        )}

        {/* View */}
        {isFiltering
          ? <InfiniteGrid query={debounced} tag={activeTag} isPro={isPro} />
          : tagsReady && rowTags.map((tag) => (
              <CourseRow key={tag} tag={tag} isPro={isPro} onTagClick={setActiveTag} />
            ))
        }

        {/* Guest CTA */}
        {!isAuth && (
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary/10 to-blue-900/20 border border-primary/20 p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Start learning for free</h3>
            <p className="text-muted-foreground mb-6">Join thousands of developers leveling up on MentiCode.</p>
            <Button variant="gradient" size="lg" asChild>
              <Link to="/register">Get started — it's free <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}
