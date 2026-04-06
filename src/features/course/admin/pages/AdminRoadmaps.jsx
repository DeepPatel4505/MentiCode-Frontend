import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Search, Map, Eye, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import {
  fetchAdminRoadmaps, deleteRoadmap, updateRoadmap,
  selectAdminRoadmaps, selectAdminRoadmapsLoading,
} from "@/app/store/slices/adminSlice";
import { Button } from "@/components/ui/Button";
import { Input, Card, Badge, Skeleton } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";

export default function AdminRoadmaps() {
  const dispatch  = useDispatch();
  const { toast } = useToast();
  const roadmaps  = useSelector(selectAdminRoadmaps);
  const loading   = useSelector(selectAdminRoadmapsLoading);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { dispatch(fetchAdminRoadmaps()); }, [dispatch]);

  const handlePublish = async (r) => {
    const next = r.status === "published" ? "draft" : "published";
    const res = await dispatch(updateRoadmap({ id: r.id, data: { status: next } }));
    if (res.meta.requestStatus === "fulfilled")
      toast({ title: next === "published" ? "Published!" : "Unpublished", type: "success" });
    else toast({ title: "Error", description: res.payload, type: "error" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this roadmap? This cannot be undone.")) return;
    const res = await dispatch(deleteRoadmap(id));
    if (res.meta.requestStatus === "fulfilled") toast({ title: "Deleted", type: "info" });
    else toast({ title: "Error", description: res.payload, type: "error" });
  };

  const filtered = roadmaps.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !status || r.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roadmaps</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{roadmaps.length} total roadmaps</p>
        </div>
        <Button variant="gradient" size="sm" asChild className="gap-2">
          <Link to="/admin/roadmaps/new"><Plus className="w-4 h-4" /> New roadmap</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search roadmaps…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <th>Roadmap</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">Tracks</th>
                <th className="hidden md:table-cell">Enrollments</th>
                <th className="hidden lg:table-cell">Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><Skeleton className="h-12 w-full rounded-lg" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Map className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No roadmaps found
                  </td>
                </tr>
              ) : filtered.map((r) => {
                const statusVariant = { published: "success", draft: "warning", archived: "secondary" };
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-blue-900/10 flex items-center justify-center shrink-0">
                          {r.thumbnail
                            ? <img src={r.thumbnail} className="w-full h-full object-cover" alt="" />
                            : <Map className="w-4 h-4 text-primary/40" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[200px]">{r.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant={statusVariant[r.status] ?? "secondary"}>{r.status}</Badge></td>
                    <td className="hidden sm:table-cell text-sm text-muted-foreground">{r.tracks?.length ?? r._count?.tracks ?? 0}</td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">{r._count?.enrollments ?? 0}</td>
                    <td className="hidden lg:table-cell text-sm text-muted-foreground">{timeAgo(r.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button size="xs" variant="ghost" asChild>
                          <Link to={`/roadmaps/${r.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /></Link>
                        </Button>
                        <Button size="xs" variant="ghost" asChild>
                          <Link to={`/admin/roadmaps/${r.id}/edit`}><Pencil className="w-3.5 h-3.5" /></Link>
                        </Button>
                        <Button
                          size="xs" variant="ghost"
                          className={r.status === "published" ? "text-warning" : "text-primary"}
                          onClick={() => handlePublish(r)}
                          title={r.status === "published" ? "Unpublish" : "Publish"}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="xs" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)}>
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
