import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Search, BookOpen, Eye, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { fetchAdminCourses, publishCourse, deleteCourse, selectAdminCourses, selectAdminLoading } from "@/app/store/slices/adminSlice";
import { Button } from "@/components/ui/Button";
import { Input, Card, Badge, Skeleton } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import { cn, getDifficultyConfig, timeAgo } from "@/lib/utils";

export default function AdminCourses() {
  const dispatch  = useDispatch();
  const { toast } = useToast();
  const courses   = useSelector(selectAdminCourses);
  const loading   = useSelector(selectAdminLoading);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");

  useEffect(() => {
    dispatch(fetchAdminCourses({ ...(status && { status }), ...(search && { search }) }));
  }, [dispatch, status, search]);

  const handlePublish = async (id) => {
    const res = await dispatch(publishCourse(id));
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Published!", type: "success" });
    else toast({ title: "Error", description: res.payload, type: "error" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    const res = await dispatch(deleteCourse(id));
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Deleted", type: "info" });
    else toast({ title: "Error", description: res.payload, type: "error" });
  };

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !status || c.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{courses.length} total courses</p>
        </div>
        <Button variant="gradient" size="sm" asChild className="gap-2">
          <Link to="/admin/courses/new"><Plus className="w-4 h-4" /> New course</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search courses…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["", "draft", "published", "archived"].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn("px-3.5 py-2 rounded-xl text-sm font-medium transition-all border capitalize",
                status === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">Difficulty</th>
                <th className="hidden md:table-cell">Free up to</th>
                <th className="hidden md:table-cell">Students</th>
                <th className="hidden lg:table-cell">Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><Skeleton className="h-12 w-full rounded-lg" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No courses found
                  </td>
                </tr>
              ) : filtered.map((c) => {
                const diff = getDifficultyConfig(c.difficulty);
                const statusVariant = { published: "success", draft: "warning", archived: "secondary" };
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-blue-900/10 flex items-center justify-center shrink-0">
                          {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" alt="" /> : <BookOpen className="w-4 h-4 text-primary/40" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[180px]">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.totalXp} XP</p>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant={statusVariant[c.status] ?? "secondary"}>{c.status}</Badge></td>
                    <td className="hidden sm:table-cell"><span className={cn("text-xs font-medium", diff.color)}>{diff.label}</span></td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.freeUpToLesson === null ? "All free" : c.freeUpToLesson === 0 ? "Pro only" : `${c.freeUpToLesson} lessons`}
                    </td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">{c._count?.enrollments ?? 0}</td>
                    <td className="hidden lg:table-cell text-sm text-muted-foreground">{timeAgo(c.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button size="xs" variant="ghost" asChild>
                          <Link to={`/courses/${c.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /></Link>
                        </Button>
                        <Button size="xs" variant="ghost" asChild>
                          <Link to={`/admin/courses/${c.id}/edit`}><Pencil className="w-3.5 h-3.5" /></Link>
                        </Button>
                        {c.status === "draft" && (
                          <Button size="xs" variant="ghost" className="text-primary" onClick={() => handlePublish(c.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button size="xs" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
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
  );
}
