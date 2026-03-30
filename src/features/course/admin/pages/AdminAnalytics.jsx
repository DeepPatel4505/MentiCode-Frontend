import { useEffect, useState } from "react";
import { TrendingUp, Users, BookOpen, Zap, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { Card, CardContent, Skeleton } from "@/components/ui/index";
import { cn } from "@/lib/utils";
import useCourse from "@/features/course/hooks/useCourse";

const BLUE_PALETTE = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1D4ED8"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-xl text-sm">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">
          {p.name}: <span className="text-foreground font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const { adminStats: stats, adminCourses: courses } = useCourse();
  const [loading, setLoading] = useState(!stats);

  useEffect(() => { if (stats) setLoading(false); }, [stats]);

  // Build chart data from available courses
  const difficultyData = [
    { name: "Beginner",     value: courses.filter((c) => c.difficulty === "beginner").length },
    { name: "Intermediate", value: courses.filter((c) => c.difficulty === "intermediate").length },
    { name: "Advanced",     value: courses.filter((c) => c.difficulty === "advanced").length },
  ].filter((d) => d.value > 0);

  const statusData = [
    { name: "Published", value: courses.filter((c) => c.status === "published").length },
    { name: "Draft",     value: courses.filter((c) => c.status === "draft").length },
    { name: "Archived",  value: courses.filter((c) => c.status === "archived").length },
  ].filter((d) => d.value > 0);

  const enrollmentData = courses
    .filter((c) => c._count?.enrollments > 0)
    .sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0))
    .slice(0, 8)
    .map((c) => ({ name: c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title, enrollments: c._count?.enrollments ?? 0 }));

  const xpData = courses
    .filter((c) => c.totalXp > 0)
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, 8)
    .map((c) => ({ name: c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title, xp: c.totalXp }));

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,   label: "Total courses",     value: stats?.totalCourses ?? 0,     color: "text-primary" },
          { icon: Users,      label: "Total enrollments", value: stats?.totalEnrollments ?? 0, color: "text-green-400" },
          { icon: TrendingUp, label: "Published",          value: stats?.publishedCourses ?? 0, color: "text-blue-400" },
          { icon: Zap,        label: "Total XP available", value: courses.reduce((a, c) => a + c.totalXp, 0), color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className={cn("w-4 h-4", s.color)} />
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollments per course */}
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Enrollments by course
            </h2>
            {enrollmentData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No enrollment data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enrollmentData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* XP per course */}
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> XP by course
            </h2>
            {xpData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No XP data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={xpData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="xp" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* By difficulty */}
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-semibold mb-4">Courses by difficulty</h2>
            {difficultyData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {difficultyData.map((_, i) => <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {difficultyData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: BLUE_PALETTE[i % BLUE_PALETTE.length] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By status */}
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-semibold mb-4">Courses by status</h2>
            {statusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {statusData.map((_, i) => <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: BLUE_PALETTE[i % BLUE_PALETTE.length] }} />
                        <span className="text-muted-foreground capitalize">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
