import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Zap, BookOpen, Map, Trophy, ChevronRight, Play, Star, Code2, CheckCircle2, ArrowRight, Users } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/index";
import { selectIsAuth } from "@/app/store/slices/authSlice";
import api from "@/lib/axios";
import { cn, getDifficultyConfig } from "@/lib/utils";

const features = [
  { icon: Play,     title: "Bite-sized video lessons",   desc: "Short, focused videos that teach one concept at a time." },
  { icon: Zap,      title: "Interactive game levels",    desc: "Reinforce learning through quizzes and code challenges." },
  { icon: Map,      title: "Guided roadmaps",            desc: "Structured learning paths built by industry experts." },
  { icon: Trophy,   title: "XP & achievements",          desc: "Stay motivated with rewards, streaks and badges." },
];

const testimonials = [
  { name: "Aria K.",    text: "Mimo made learning JavaScript actually fun. I finished my first project in 3 weeks.",    rating: 5 },
  { name: "Dev M.",     text: "The game levels are addictive. I didn't realise I'd been studying for 2 hours straight.", rating: 5 },
  { name: "Priya L.",   text: "Best structured learning platform I've used. The roadmaps are incredibly well thought-out.", rating: 5 },
];

const stats = [
  { value: "50k+",  label: "Active learners" },
  { value: "200+",  label: "Courses" },
  { value: "2M+",   label: "XP awarded" },
  { value: "94%",   label: "Completion rate" },
];

export default function HomePage() {
  const isAuth = useSelector(selectIsAuth);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/courses", { params: { status: "published", limit: 4 } })
      .then((r) => setCourses(r.data.data.courses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Shell fullWidth>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[100px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
            {/* Label pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-3.5 h-3.5" />
              The modern way to learn coding
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Learn to code{" "}
              <span className="relative">
                <span className="gradient-text">game-style</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Master programming through short video lessons, then lock in the knowledge with interactive game levels.
              Earn XP, maintain streaks, and level up your career.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {isAuth ? (
                <Button variant="gradient" size="xl" asChild className="gap-2">
                  <Link to="/courses">Continue learning <ArrowRight className="w-5 h-5" /></Link>
                </Button>
              ) : (
                <>
                  <Button variant="gradient" size="xl" asChild className="gap-2 blue-glow">
                    <Link to="/register">Start for free <ArrowRight className="w-5 h-5" /></Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild>
                    <Link to="/courses">Browse courses</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold gradient-text">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete learning system designed around how developers actually learn.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={f.title}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured courses ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Popular courses</h2>
              <p className="text-muted-foreground">Jump into the most loved content</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full rounded-2xl" style={{ height: 160 }} />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {courses.map((c) => {
                const diff = getDifficultyConfig(c.difficulty);
                return (
                  <Link key={c.id} to={`/courses/${c.slug}`}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-blue-900/20 relative overflow-hidden">
                      {c.thumbnail
                        ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center"><Code2 className="w-10 h-10 text-primary/30" /></div>
                      }
                      {c.totalXp > 0 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-xs font-bold text-primary">
                          <Zap className="w-3 h-3" /> {c.totalXp} XP
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{c.title}</h3>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", diff.bg, diff.color)}>{diff.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Testimonials ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Loved by developers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-background border border-primary/20 p-12 text-center">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-5">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Ready to level up?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join over 50,000 learners. Free forever for core content.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="gradient" size="lg" asChild className="blue-glow gap-2">
                  <Link to="/register">Create free account <ArrowRight className="w-4 h-4" /></Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </Shell>
    </div>
  );
}
