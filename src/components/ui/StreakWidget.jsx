import { Flame, Zap } from "lucide-react";
import { Tooltip } from "@/components/ui/index";
import { cn } from "@/lib/utils";
import useCourse from "@/features/course/hooks/useCourse";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getXpProgress } from "@/features/course/context/course.context";

// ── Streak Widget ─────────────────────────────────────────────
export function StreakWidget({ className }) {
  const { streak } = useCourse();
  const days   = streak ?? 0;

  if (!days && days !== 0) return null;

  const isHot    = days >= 7;
  const isOnFire = days >= 30;

  return (
    <Tooltip content={`${days}-day streak! ${isOnFire ? "🔥 On fire!" : isHot ? "🌟 Great consistency!" : "Keep it going!"}`}>
      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-sm select-none cursor-default",
        days === 0
          ? "bg-secondary text-muted-foreground"
          : isOnFire
          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
          : isHot
          ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-500/20"
          : "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        className
      )}>
        <Flame className={cn("w-4 h-4", days > 0 && "fire-pulse")} />
        <span>{days}</span>
      </div>
    </Tooltip>
  );
}

// ── XP Bar ────────────────────────────────────────────────────
export function XpBar({ className, showLabel = true }) {
  const { xpTotal: xp } = useCourse();
  const { pct, current, next, xpInLevel, xpNeeded } = getXpProgress(xp ?? 0);

  return (
    <Tooltip content={next ? `${xpInLevel} / ${xpNeeded} XP to Level ${next.level}` : "Max level!"}>
      <div className={cn("flex items-center gap-2 cursor-default", className)}>
        {showLabel && (
          <div className="flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">Lv.{current.level}</span>
          </div>
        )}
        <div className="flex-1 min-w-[60px] relative h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        {showLabel && next && (
          <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
        )}
      </div>
    </Tooltip>
  );
}

// ── Compact XP + Streak combined for Navbar ────────────────────
export function GamificationBar({ className }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className={cn("hidden md:flex items-center gap-3", className)}>
      <StreakWidget />
      <div className="w-28">
        <XpBar showLabel={false} />
      </div>
    </div>
  );
}
