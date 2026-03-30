import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, TrendingUp, Eye, Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Badge, Skeleton } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import { cn, getDifficultyConfig, timeAgo } from "@/lib/utils";
import useCourse from "@/features/course/hooks/useCourse";

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn("w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center", color === "text-green-400" && "bg-success/10", color === "text-amber-400" && "bg-warning/10")}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const {
    adminStats: stats,
    adminCourses: courses,
    adminLoading: loading,
    fetchAdminStats,
    publishCourse,
    deleteCourse,
  } = useCourse();

  useEffect(() => { fetchAdminStats(); }, [fetchAdminStats]);

  const handlePublish = async (id) => {
    const res = await publishCourse(id);
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Course published!", type: "success" });
    else toast({ title: "Error", description: res.payload, type: "error" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    const res = await deleteCourse(id);
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Course deleted", type: "info" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Overview of your platform</p>
        </div>
        <Button variant="gradient" size="sm" asChild className="gap-2">
          <Link to="/admin/courses/new"><Plus className="w-4 h-4" /> New course</Link>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen}   label="Total courses"     value={stats?.totalCourses     ?? 0} sub={`${stats?.publishedCourses ?? 0} published`} />
          <StatCard icon={Users}      label="Total enrollments" value={stats?.totalEnrollments ?? 0} color="text-green-400" />
          <StatCard icon={TrendingUp} label="Reviews"           value={stats?.totalReviews     ?? 0} color="text-amber-400" />
          <StatCard icon={Eye}        label="Draft courses"     value={stats?.draftCourses     ?? 0} color="text-muted-foreground" />
        </div>
      )}

      {/* Recent courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent courses</h2>
          <Link to="/admin/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Difficulty</th>
                  <th className="hidden md:table-cell">Students</th>
                  <th className="hidden lg:table-cell">Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6}><Skeleton className="h-10 w-full" /></td></tr>
                  ))
                ) : courses.slice(0, 8).map((c) => {
                  const diff = getDifficultyConfig(c.difficulty);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-900/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" /> : <BookOpen className="w-4 h-4 text-primary/50" />}
                          </div>
                          <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{c.title}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={c.status === "published" ? "success" : c.status === "draft" ? "warning" : "secondary"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className={cn("text-xs font-medium", diff.color)}>{diff.label}</span>
                      </td>
                      <td className="hidden md:table-cell text-sm text-muted-foreground">
                        {c._count?.enrollments ?? 0}
                      </td>
                      <td className="hidden lg:table-cell text-sm text-muted-foreground">
                        {timeAgo(c.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/courses/${c.id}/edit`}>
                            <Button size="xs" variant="ghost">Edit</Button>
                          </Link>
                          {c.status === "draft" && (
                            <Button size="xs" variant="ghost" className="text-primary" onClick={() => handlePublish(c.id)}>
                              Publish
                            </Button>
                          )}
                          <Button size="xs" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
