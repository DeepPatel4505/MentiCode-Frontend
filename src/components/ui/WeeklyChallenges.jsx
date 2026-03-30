import { Zap, Trophy, Flame, Target, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

const CHALLENGES = [
  {
    id: "daily-lesson",
    title: "Daily Lesson",
    description: "Complete 1 lesson today",
    xp: 10,
    icon: Target,
    color: "text-blue-400",
    bg: "from-blue-600/20 to-blue-900/10",
    border: "border-blue-500/20",
    progress: 0,
    total: 1,
    pro: false,
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Pass 3 game levels this week",
    xp: 50,
    icon: Trophy,
    color: "text-amber-400",
    bg: "from-amber-500/20 to-amber-900/10",
    border: "border-amber-500/20",
    progress: 1,
    total: 3,
    pro: false,
  },
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Maintain a 7-day streak",
    xp: 100,
    icon: Flame,
    color: "text-orange-400",
    bg: "from-orange-500/20 to-red-900/10",
    border: "border-orange-500/20",
    progress: 3,
    total: 7,
    pro: false,
  },
  {
    id: "xp-grinder",
    title: "XP Grinder",
    description: "Earn 200 XP in a week",
    xp: 75,
    icon: Zap,
    color: "text-primary",
    bg: "from-primary/20 to-blue-900/10",
    border: "border-primary/20",
    progress: 80,
    total: 200,
    pro: true,
  },
];

function ChallengeCard({ challenge, isPro }) {
  const locked   = challenge.pro && !isPro;
  const pct      = Math.round((challenge.progress / challenge.total) * 100);
  const done     = pct >= 100;

  return (
    <div className={cn(
      "challenge-card relative overflow-hidden transition-all duration-200",
      locked && "opacity-60",
      done && "border-success/30"
    )}>
      {/* Gradient bg */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", challenge.bg)} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-card/80", challenge.border, "border")}>
            {locked
              ? <Lock className="w-4 h-4 text-muted-foreground" />
              : done
              ? <CheckCircle2 className="w-4 h-4 text-green-400" />
              : <challenge.icon className={cn("w-4 h-4", challenge.color)} />
            }
          </div>
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
            done ? "bg-success/10 text-green-400 border border-success/20" : "bg-card/80 border border-border text-muted-foreground"
          )}>
            <Zap className="w-3 h-3" />
            +{challenge.xp} XP
          </div>
        </div>

        <h3 className="font-bold text-sm mb-0.5">{challenge.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>

        {locked ? (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Requires Pro
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{challenge.progress}/{challenge.total}</span>
              <span className={cn("font-bold", done ? "text-green-400" : challenge.color)}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", done ? "bg-emerald-500" : "bg-primary")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WeeklyChallenges() {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg">Weekly Challenges</h2>
          <p className="text-xs text-muted-foreground">Resets every Monday</p>
        </div>
        <Link to="/leaderboard" className="text-xs text-primary hover:underline font-medium">
          Leaderboard →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHALLENGES.map((c) => (
          <ChallengeCard key={c.id} challenge={c} isPro={isPro} />
        ))}
      </div>
    </div>
  );
}
