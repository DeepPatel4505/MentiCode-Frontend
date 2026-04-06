import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy, Zap, Crown, Medal, BookOpen } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { PageHeader } from "@/components/layout/Shell";
import { Card, CardContent, Avatar, Skeleton } from "@/components/ui/index";
import { fetchLeaderboard, selectLeaderboard } from "@/app/store/slices/gamificationSlice";
import { selectUser } from "@/app/store/slices/authSlice";
import { cn, formatXp } from "@/lib/utils";

// ── Rank badge ────────────────────────────────────────────────

const RANK_CFG = {
  1: { bg: "bg-amber-400/15 border-amber-400/40",   text: "text-amber-300",  icon: Crown, iconCls: "text-amber-400 fill-amber-400/80" },
  2: { bg: "bg-slate-400/10 border-slate-400/30",   text: "text-slate-300",  icon: Medal, iconCls: "text-slate-300" },
  3: { bg: "bg-orange-700/10 border-orange-700/30", text: "text-orange-400", icon: Medal, iconCls: "text-orange-500" },
};

function RankBadge({ rank }) {
  const cfg = RANK_CFG[rank];
  if (!cfg) {
    return (
      <span className="w-7 text-center text-sm font-bold tabular-nums text-muted-foreground">
        {rank}
      </span>
    );
  }
  const Icon = cfg.icon;
  return (
    <div className={cn("w-7 h-7 rounded-full border flex items-center justify-center shrink-0", cfg.bg)}>
      <Icon className={cn("w-3.5 h-3.5", cfg.iconCls)} />
    </div>
  );
}

function LevelBadge({ level }) {
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
      Lv {level}
    </span>
  );
}

// ── Single row ────────────────────────────────────────────────

function LeaderboardRow({ entry, isMe, rank }) {
  const cfg = RANK_CFG[rank];
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
      isMe
        ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
        : rank <= 3
          ? cn("border-border/60", cfg?.bg ?? "bg-card")
          : "border-border bg-card hover:border-border/70 hover:bg-card/80"
    )}>
      <div className="shrink-0 w-7 flex justify-center">
        <RankBadge rank={rank} />
      </div>
      <Avatar src={entry.avatarUrl} name={entry.username} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={cn(
            "font-semibold text-sm truncate",
            isMe ? "text-primary" : rank === 1 ? "text-amber-300" : "text-foreground"
          )}>
            {entry.username}
          </p>
          {isMe && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
              You
            </span>
          )}
          <LevelBadge level={entry.level} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Zap className={cn("w-3.5 h-3.5", rank === 1 ? "text-amber-400" : "text-primary")} />
        <span className={cn("font-bold text-sm tabular-nums", rank === 1 ? "text-amber-300" : "text-foreground")}>
          {formatXp(entry.xpTotal)}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:block">XP</span>
      </div>
    </div>
  );
}

// ── Podium card ───────────────────────────────────────────────

const PODIUM_ORDER = [2, 1, 3];

const PODIUM_STYLE = {
  1: {
    wrapper:  "order-2 z-10",
    card:     "border-amber-400/30 bg-gradient-to-b from-amber-400/8 to-card shadow-lg shadow-amber-400/5",
    ring:     "ring-2 ring-amber-400/50",
    iconBg:   "bg-amber-400/15 border-amber-400/30",
    icon:     Crown,
    iconCls:  "text-amber-400 fill-amber-400/80",
    xpBadge:  "bg-amber-400/15 text-amber-300 border-amber-400/30",
    height:   "pb-0",
    avatarSz: "lg",
    nameSize: "text-sm",
  },
  2: {
    wrapper:  "order-1",
    card:     "border-slate-500/20 bg-card",
    ring:     "ring-2 ring-slate-400/40",
    iconBg:   "bg-slate-400/10 border-slate-400/20",
    icon:     Medal,
    iconCls:  "text-slate-300",
    xpBadge:  "bg-slate-400/10 text-slate-300 border-slate-400/20",
    height:   "pb-4",
    avatarSz: "md",
    nameSize: "text-xs",
  },
  3: {
    wrapper:  "order-3",
    card:     "border-orange-700/20 bg-card",
    ring:     "ring-2 ring-orange-700/40",
    iconBg:   "bg-orange-700/10 border-orange-700/20",
    icon:     Medal,
    iconCls:  "text-orange-500",
    xpBadge:  "bg-orange-700/10 text-orange-400 border-orange-700/20",
    height:   "pb-4",
    avatarSz: "md",
    nameSize: "text-xs",
  },
};

function PodiumCard({ entry, rank }) {
  const s    = PODIUM_STYLE[rank];
  const Icon = s.icon;
  return (
    <div className={cn("flex flex-col items-center gap-2.5 p-4 rounded-2xl border text-center", s.card, s.height, s.wrapper)}>
      <div className={cn("p-2 rounded-full border", s.iconBg)}>
        <Icon className={cn("w-5 h-5", s.iconCls)} />
      </div>
      <Avatar src={entry.avatarUrl} name={entry.username} size={s.avatarSz} className={s.ring} />
      <div className="space-y-0.5">
        <p className={cn("font-bold truncate max-w-[90px]", s.nameSize)}>{entry.username}</p>
        <p className="text-[11px] text-muted-foreground">Level {entry.level}</p>
      </div>
      <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold", s.xpBadge)}>
        <Zap className="w-3 h-3" />
        {formatXp(entry.xpTotal)} XP
      </div>
    </div>
  );
}

// ── Skeleton / Empty ──────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-3 items-end">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
      <p className="font-semibold text-muted-foreground">No rankings yet</p>
      <p className="text-sm text-muted-foreground/60 mt-1">Complete lessons to earn XP and appear here.</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const dispatch    = useDispatch();
  const leaderboard = useSelector(selectLeaderboard);
  const me          = useSelector(selectUser);

  useEffect(() => { dispatch(fetchLeaderboard()); }, [dispatch]);

  const meIdx = leaderboard.findIndex(
    (e) => e.userId === me?.id || e.username === me?.username
  );

  const showPodium = leaderboard.length >= 3;
  const top3       = leaderboard.slice(0, 3);

  let listEntries;
  if (meIdx === -1 || !showPodium) {
    listEntries = leaderboard.slice(showPodium ? 3 : 0, showPodium ? 13 : 10);
  } else {
    const start = Math.max(showPodium ? 3 : 0, Math.min(meIdx - 4, leaderboard.length - 10));
    listEntries = leaderboard.slice(start, start + 10);
  }

  const showTopEllipsis = showPodium && listEntries.length > 0 && listEntries[0].rank > 4;
  const showBotEllipsis = listEntries.length > 0 && listEntries[listEntries.length - 1].rank < leaderboard.length;

  return (
    <Shell>
      <PageHeader title="Leaderboard" description="All-time XP rankings — earn XP to climb" />

      <div className="max-w-2xl mx-auto space-y-6">

        {!leaderboard.length ? (
          <LoadingSkeleton />
        ) : leaderboard.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {showPodium && (
              <div className="grid grid-cols-3 gap-3 items-end">
                {PODIUM_ORDER.map((rank) => (
                  <PodiumCard key={rank} entry={top3[rank - 1]} rank={rank} />
                ))}
              </div>
            )}

            {listEntries.length > 0 && (
              <div className="space-y-1.5">
                {showTopEllipsis && (
                  <p className="text-xs text-muted-foreground/40 text-center py-1 tracking-widest select-none">· · ·</p>
                )}
                {listEntries.map((e) => (
                  <LeaderboardRow
                    key={e.rank}
                    entry={e}
                    rank={e.rank}
                    isMe={e.userId === me?.id || e.username === me?.username}
                  />
                ))}
                {showBotEllipsis && (
                  <p className="text-xs text-muted-foreground/40 text-center py-1 tracking-widest select-none">· · ·</p>
                )}
              </div>
            )}
          </>
        )}

        <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-bold">How to earn XP</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
              <div className="p-3 rounded-xl bg-secondary/60 border border-border/50">
                <BookOpen className="w-4 h-4 text-primary mx-auto mb-1.5" />
                <span className="font-bold text-primary text-sm block">+5</span>
                Complete lesson
              </div>
              <div className="p-3 rounded-xl bg-secondary/60 border border-border/50">
                <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
                <span className="font-bold text-amber-400 text-sm block">+10</span>
                Pass quiz
              </div>
              <div className="p-3 rounded-xl bg-secondary/60 border border-border/50">
                <Zap className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                <span className="font-bold text-orange-400 text-sm block">2×</span>
                Streak bonus
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
