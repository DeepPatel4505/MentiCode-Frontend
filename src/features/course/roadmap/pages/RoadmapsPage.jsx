import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Map, Lock, Zap, BookOpen, ChevronRight, Search, Users, Star } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Badge, Skeleton } from "@/components/ui/index";
import { cn } from "@/lib/utils";
import useCourse from "@/features/course/hooks/useCourse";
import { useAuth } from "@/features/auth/hooks/useAuth";

// ── Roadmap card ──────────────────────────────────────────────
function RoadmapCard({ roadmap }) {
  const courseCount = roadmap.courseCount ?? 0;
  const enrollCount = roadmap._count?.enrollments ?? 0;

  return (
    <Link to={`/roadmaps/${roadmap.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 shrink-0" />

        <CardContent className="p-5 flex flex-col gap-4 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-blue-900/20 border border-primary/20 flex items-center justify-center shrink-0">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="pro" className="shrink-0">PRO</Badge>
          </div>

          {/* Title + description */}
          <div className="flex-1">
            <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors mb-1.5">
              {roadmap.title}
            </h3>
            {roadmap.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {roadmap.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {roadmap.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {roadmap.tags.slice(0, 3).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground border border-border/50">
                  {t}
                </span>
              ))}
              {roadmap.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-xs text-muted-foreground">
                  +{roadmap.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {courseCount} course{courseCount !== 1 ? "s" : ""}
              </span>
              {enrollCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {enrollCount}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Skeleton card ─────────────────────────────────────────────
function RoadmapCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-secondary" />
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RoadmapsPage() {
  const { user } = useAuth();
  const isAuth = !!user;
  const isPro = user?.plan === "pro";
  const { roadmapList: roadmaps, roadmapLoading: loading, fetchRoadmaps } = useCourse();

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => { fetchRoadmaps({ status: "published", limit: 50 }); }, [fetchRoadmaps]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    roadmaps.forEach((rm) => rm.tags?.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [roadmaps]);

  const filtered = useMemo(() => {
    let list = roadmaps;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((rm) =>
        rm.title.toLowerCase().includes(q) ||
        rm.description?.toLowerCase().includes(q) ||
        rm.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeTag) {
      list = list.filter((rm) => rm.tags?.includes(activeTag));
    }
    return list;
  }, [roadmaps, search, activeTag]);

  return (
    <Shell showNavbar={false}>
      {/* ── Hero ── */}
      <div className="relative mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950/60 via-background to-background border border-primary/20 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Map className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Learning Roadmaps</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Structured paths to mastery</h1>
            <p className="text-muted-foreground max-w-lg">
              Curated learning tracks built by industry experts — from beginner to job-ready developer.
            </p>
          </div>
          {!isPro && (
            <Button variant="gradient" size="lg" className="gap-2 shrink-0" asChild>
              <Link to="/pricing"><Zap className="w-4 h-4" /> Upgrade to Pro</Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Pro gate banner ── */}
      {!isPro && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Roadmaps require a <span className="text-foreground font-medium">Pro plan</span>. You can browse all roadmaps, but enrollment requires upgrading.
          </p>
        </div>
      )}

      {/* ── Search + tag filters ── */}
      {!loading && roadmaps.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roadmaps..."
              className="w-full pl-9 pr-4 h-9 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                    activeTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <RoadmapCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {roadmaps.length === 0 ? "No roadmaps available yet" : "No roadmaps match your search"}
          </p>
          {(search || activeTag) && (
            <button
              onClick={() => { setSearch(""); setActiveTag(null); }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rm) => <RoadmapCard key={rm.id} roadmap={rm} />)}
        </div>
      )}
    </Shell>
  );
}

export default RoadmapsPage;
