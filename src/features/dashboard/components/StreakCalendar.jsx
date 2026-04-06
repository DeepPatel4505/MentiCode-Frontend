import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarDays, Zap } from "lucide-react";

const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// GitHub-style green palette
const CELL_COLORS = [
  "bg-[#161b22] border border-[#ffffff06]",  // 0 — empty
  "bg-[#0e4429]",                              // 1 — faint
  "bg-[#006d32]",                              // 2
  "bg-[#26a641]",                              // 3
  "bg-[#39d353]",                              // 4 — most active
];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function intensity(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3)  return 2;
  if (count <= 6)  return 3;
  return 4;
}

/**
 * Build a rolling 12-month grid (last 12 full months + current partial month).
 * Returns { weeks, monthLabels } where each week is an array of 7 cells.
 */
function buildRollingGrid(calendar) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start: first Sunday on or before (today - 364 days)
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // snap to Sunday

  const weeks  = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (cursor > today) {
        week.push(null);
      } else {
        const key = toKey(cursor);
        week.push({ date: key, count: calendar[key] ?? 0 });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Build month labels: find first week where month changes
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find(Boolean);
    if (!first) return;
    const m = parseInt(first.date.slice(5, 7), 10) - 1;
    if (m !== lastMonth) {
      monthLabels.push({ wi, label: MONTHS[m] });
      lastMonth = m;
    }
  });

  return { weeks, monthLabels };
}

/**
 * Build a full calendar-year grid (Jan 1 → Dec 31).
 */
function buildYearGrid(calendar, year) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() - start.getDay()); // snap to Sunday

  const end = new Date(year, 11, 31);
  end.setDate(end.getDate() + (6 - end.getDay())); // snap to Saturday

  const weeks  = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const inYear   = cursor.getFullYear() === year;
      const isFuture = cursor > today;
      if (!inYear) {
        week.push(null);
      } else {
        const key = toKey(cursor);
        week.push({ date: key, count: calendar[key] ?? 0, isFuture });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find((c) => c && !c.isFuture) ?? week.find(Boolean);
    if (!first) return;
    const m = parseInt(first.date.slice(5, 7), 10) - 1;
    if (m !== lastMonth) {
      monthLabels.push({ wi, label: MONTHS[m] });
      lastMonth = m;
    }
  });

  return { weeks, monthLabels };
}

function computeYearStats(calendar, year) {
  const keys = Object.keys(calendar).filter((k) => k.startsWith(`${year}-`)).sort();
  let longest = 0, temp = 0, prev = null;
  for (const d of keys) {
    if (!prev) { temp = 1; }
    else {
      const diff = Math.round((new Date(d) - new Date(prev)) / 86400000);
      temp = diff === 1 ? temp + 1 : 1;
    }
    if (temp > longest) longest = temp;
    prev = d;
  }
  const todayKey  = toKey(new Date());
  const yesterKey = toKey(new Date(Date.now() - 86400000));
  const lastKey   = keys[keys.length - 1] ?? null;
  const current   = (lastKey === todayKey || lastKey === yesterKey) ? temp : 0;
  return { currentStreak: current, longestStreak: longest, activeDays: keys.length };
}

function StatPill({ icon: Icon, label, value, color = "text-foreground" }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 border border-border/50">
      <Icon className={cn("w-4 h-4 shrink-0", color)} />
      <div>
        <p className={cn("text-sm font-bold leading-none", color)}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">{label}</p>
      </div>
    </div>
  );
}

// ── Heatmap grid renderer ─────────────────────────────────────

function HeatmapGrid({ weeks, monthLabels, showFuture = false }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex flex-col gap-[3px] min-w-max">

        {/* Month labels */}
        <div className="flex gap-[3px] pl-[34px]">
          {weeks.map((_, wi) => {
            const lbl = monthLabels.find((m) => m.wi === wi);
            return (
              <div key={wi} className="w-[12px] text-[10px] text-muted-foreground/60 leading-none select-none">
                {lbl ? lbl.label : ""}
              </div>
            );
          })}
        </div>

        {/* Day rows */}
        {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-[3px]">
            <span className="w-[30px] text-[10px] text-muted-foreground/50 text-right pr-1.5 select-none shrink-0 leading-none">
              {dayIdx % 2 === 1 ? DAY_LABELS[dayIdx] : ""}
            </span>
            {weeks.map((week, wi) => {
              const cell = week[dayIdx];
              if (!cell) return <div key={wi} className="w-[12px] h-[12px]" />;

              if (showFuture && cell.isFuture) {
                return (
                  <div
                    key={wi}
                    className="w-[12px] h-[12px] rounded-[2px] bg-[#0d1117] border border-[#ffffff04]"
                  />
                );
              }

              if (!showFuture && cell.isFuture) {
                return <div key={wi} className="w-[12px] h-[12px]" />;
              }

              const lvl = intensity(cell.count);
              return (
                <div
                  key={wi}
                  title={cell.count
                    ? `${cell.date}: ${cell.count} activit${cell.count === 1 ? "y" : "ies"}`
                    : cell.date}
                  className={cn(
                    "w-[12px] h-[12px] rounded-[2px] cursor-default transition-opacity hover:opacity-75",
                    CELL_COLORS[lvl]
                  )}
                />
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2 pl-[34px] justify-end">
          <span className="text-[10px] text-muted-foreground/40 select-none">Less</span>
          {CELL_COLORS.map((c, i) => (
            <div key={i} className={cn("w-[12px] h-[12px] rounded-[2px]", c)} />
          ))}
          <span className="text-[10px] text-muted-foreground/40 select-none">More</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function StreakCalendar({
  calendar        = {},
  totalActiveDays = 0,
}) {
  const currentYear = new Date().getFullYear();

  // Modes: "rolling" = last 12 months, or a specific year
  const [mode, setMode] = useState("rolling");

  const availableYears = useMemo(() => {
    const yrs = new Set([currentYear]);
    Object.keys(calendar).forEach((k) => yrs.add(parseInt(k.slice(0, 4), 10)));
    return [...yrs].sort((a, b) => b - a);
  }, [calendar, currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { weeks, monthLabels } = useMemo(() => {
    if (mode === "rolling") return buildRollingGrid(calendar);
    return buildYearGrid(calendar, selectedYear);
  }, [calendar, mode, selectedYear]);

  const stats = useMemo(() => {
    if (mode === "rolling") {
      const activeDays = Object.keys(calendar).filter((k) => {
        const d = new Date(k);
        const cutoff = new Date(Date.now() - 365 * 86400000);
        return d >= cutoff;
      }).length;
      return { activeDays };
    }
    if (selectedYear === currentYear) {
      const activeDays = Object.keys(calendar).filter((k) => k.startsWith(`${selectedYear}-`)).length;
      return { activeDays };
    }
    const { activeDays } = computeYearStats(calendar, selectedYear);
    return { activeDays };
  }, [calendar, mode, selectedYear, currentYear]);

  const yearIdx = availableYears.indexOf(selectedYear);

  return (
    <div className="space-y-4">
      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        <StatPill icon={CalendarDays} value={stats.activeDays} label={mode === "rolling" ? "Active days (365d)" : `Active in ${selectedYear}`} color="text-primary" />
        {totalActiveDays > 0 && (
          <StatPill icon={Zap} value={totalActiveDays} label="Total active days" color="text-violet-400" />
        )}
      </div>

      {/* View controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-secondary text-xs">
          <button
            onClick={() => setMode("rolling")}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              mode === "rolling"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Last 12 months
          </button>
          <button
            onClick={() => setMode("year")}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              mode === "year"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            By year
          </button>
        </div>

        {/* Year navigator (only in year mode) */}
        {mode === "year" && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedYear(availableYears[yearIdx + 1])}
              disabled={yearIdx >= availableYears.length - 1}
              aria-label="Previous year"
              className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold w-12 text-center select-none tabular-nums">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear(availableYears[yearIdx - 1])}
              disabled={yearIdx <= 0}
              aria-label="Next year"
              className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Heatmap */}
      <HeatmapGrid
        weeks={weeks}
        monthLabels={monthLabels}
        showFuture={mode === "year"}
      />
    </div>
  );
}
