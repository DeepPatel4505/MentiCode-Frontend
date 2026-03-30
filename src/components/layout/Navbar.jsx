import { Link, useNavigate, useLocation } from "react-router-dom";
import { Zap, LogOut, Sun, Moon, User, LayoutDashboard, ChevronDown, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar, Badge } from "@/components/ui/index";
import { XpBar } from "@/components/ui/StreakWidget";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import useCourse from "@/features/course/hooks/useCourse";

const NAV = [
  { to: "/courses",     label: "Courses" },
  { to: "/roadmaps",    label: "Roadmaps" },
  { to: "/my-learning", label: "My Learning" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { toast } = useToast();
  const { user, handleLogout: logout } = useAuth();
  const { streak } = useCourse();
  const isAuth = !!user;
  const isAdmin = user?.role === "admin";
  const isPro = user?.plan === "pro";
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast({ title: "Logged out", type: "info" });
    setOpen(false);
  };

  const active = (to) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Menti<span className="text-primary">Code</span>
            </span>
          </Link>

          {/* Nav links */}
          {isAuth && (
            <div className="hidden md:flex items-center gap-0.5">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={cn("px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    active(to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}>
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin"
                  className={cn("px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    active("/admin") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}>
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            {isAuth && streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20" title={`${streak}-day streak!`}>
                <Flame className={cn("w-4 h-4 text-orange-400", streak >= 7 && "fire-pulse")} />
                <span className="text-sm font-bold text-orange-400">{streak}</span>
              </div>
            )}

            {/* XP bar compact */}
            {isAuth && user && <div className="hidden lg:block"><XpBar compact /></div>}

            {/* Theme */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="rounded-xl"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {isAuth ? (
              <div className="relative">
                <button onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent transition-colors">
                  <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-xs font-semibold">{user?.username}</span>
                    <span className={cn("text-xs font-medium", isPro ? "text-primary" : "text-muted-foreground")}>
                      {isPro ? "Pro" : "Free"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                </button>

                {open && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-card shadow-xl z-20 overflow-hidden animate-scale-in">
                      <div className="p-4 border-b border-border space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user?.avatarUrl} name={user?.username} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm">{user?.username}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                        <XpBar />
                        {streak > 0 && (
                          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-medium">
                            <Flame className="w-3.5 h-3.5" /> {streak}-day streak
                          </div>
                        )}
                        {isPro && <Badge variant="pro">PRO</Badge>}
                      </div>
                      <div className="p-1.5">
                        <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                          <User className="w-4 h-4 text-muted-foreground" /> Profile
                        </Link>
                        <Link to="/leaderboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                          <Trophy className="w-4 h-4 text-muted-foreground" /> Leaderboard
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Admin panel
                          </Link>
                        )}
                        {!isPro && (
                          <Link to="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-primary hover:bg-primary/10 transition-colors font-medium">
                            <Zap className="w-4 h-4" /> Upgrade to Pro
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild><Link to="/login">Sign in</Link></Button>
                <Button variant="gradient" size="sm" asChild><Link to="/register">Get started</Link></Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
