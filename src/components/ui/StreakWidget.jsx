import { useSelector } from "react-redux";
import { Zap } from "lucide-react";
import { selectXpTotal, getXpProgress } from "@/app/store/slices/gamificationSlice";
import { selectUser } from "@/app/store/slices/authSlice";
import { Tooltip } from "@/components/ui/index";
import { cn } from "@/lib/utils";

// ── XP Bar ────────────────────────────────────────────────────
export function XpBar({ className, showLabel = true }) {
  const xp = useSelector(selectXpTotal);
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
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700 ease-out"
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

// ── Compact XP bar for Navbar ──────────────────────────────────
export function GamificationBar({ className }) {
  const user = useSelector(selectUser);
  if (!user) return null;

  return (
    <div className={cn("hidden md:flex items-center gap-3", className)}>
      <div className="w-28">
        <XpBar showLabel={false} />
      </div>
    </div>
  );
}
