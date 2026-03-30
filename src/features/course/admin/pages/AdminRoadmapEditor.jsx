import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ChevronLeft, Plus, Trash2, Eye, Save, Map, BookOpen, Search, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Card, CardContent, Field, Badge, Skeleton } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import useCourse from "@/features/course/hooks/useCourse";

// ── Modal wrapper ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Course picker modal ───────────────────────────────────────
function CoursePickerModal({ roadmapId, existingCourseIds, onClose, onAdded }) {
  const { addCourseToRoadmap } = useCourse();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get("/courses", { params: { status: "published", limit: 50, ...(search && { search }) } })
      .then((r) => setCourses(r.data.data.courses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const handleAdd = async () => {
    if (!selected) return;
    const res = await addCourseToRoadmap({ roadmapId, data: { courseId: selected.id } });
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Course added", type: "success" });
      onAdded({ ...res.payload, course: selected });
      onClose();
    } else toast({ title: "Error", description: res.payload, type: "error" });
  };

  const available = courses.filter((c) => !existingCourseIds.includes(c.id));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search published courses…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-xl border border-border p-2">
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading…</div>
        ) : available.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">No courses found</div>
        ) : available.map((c) => (
          <button key={c.id} type="button"
            onClick={() => setSelected(c)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors",
              selected?.id === c.id ? "bg-primary/20 border border-primary/40" : "hover:bg-accent border border-transparent"
            )}>
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
              {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" alt="" /> : <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{c.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{c.difficulty} · {c.totalXp ?? 0} XP</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="gradient" disabled={!selected} onClick={handleAdd}>Add course</Button>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────
export default function AdminRoadmapEditor() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const {
    createRoadmap,
    updateRoadmap,
    removeCourseFromRoadmap,
    adminSaving: saving,
  } = useCourse();
  const isEdit    = !!id;

  const [roadmap,  setRoadmap]  = useState(null);
  const [courses,  setCourses]  = useState([]); // flat list of nodes
  const [loading,  setLoading]  = useState(isEdit);
  const [addCourse, setAddCourse] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { status: "draft" },
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/roadmaps/${id}`)
      .then((r) => {
        const rm = r.data.data.roadmap;
        setRoadmap(rm);
        setCourses(rm.courses ?? []);
        reset({
          title:       rm.title,
          description: rm.description,
          thumbnail:   rm.thumbnail,
          tags:        rm.tags?.join(", "),
          status:      rm.status,
        });
      })
      .catch(() => toast({ title: "Failed to load roadmap", type: "error" }))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    const tags = typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : data.tags ?? [];
    const payload = { ...data, tags };

    if (isEdit) {
      const res = await updateRoadmap({ id, data: payload });
      if (res.meta.requestStatus === "fulfilled") toast({ title: "Roadmap updated!", type: "success" });
      else toast({ title: "Error", description: res.payload, type: "error" });
    } else {
      const res = await createRoadmap(payload);
      if (res.meta.requestStatus === "fulfilled") {
        toast({ title: "Roadmap created!", type: "success" });
        navigate(`/admin/roadmaps/${res.payload.id}/edit`);
      } else toast({ title: "Error", description: res.payload, type: "error" });
    }
  };

  const handleRemoveCourse = async (nodeId) => {
    const res = await removeCourseFromRoadmap({ roadmapId: id, nodeId });
    if (res.meta.requestStatus === "fulfilled") {
      setCourses((prev) => prev.filter((n) => n.id !== nodeId));
      toast({ title: "Course removed", type: "info" });
    } else toast({ title: "Error", description: res.payload, type: "error" });
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  const existingCourseIds = courses.map((n) => n.courseId ?? n.course?.id).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link to="/admin/roadmaps" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Roadmaps
        </Link>
        {isEdit && roadmap && (
          <Badge variant={roadmap.status === "published" ? "success" : "warning"}>{roadmap.status}</Badge>
        )}
        {isEdit && roadmap && (
          <Button size="xs" variant="ghost" className="ml-auto" asChild>
            <Link to={`/roadmaps/${roadmap.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /> Preview</Link>
          </Button>
        )}
      </div>

      <h1 className="text-2xl font-bold">{isEdit ? "Edit roadmap" : "New roadmap"}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-4">Roadmap details</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Field label="Title *" error={errors.title?.message}>
                  <Input
                    {...register("title", { required: "Title is required", minLength: { value: 3, message: "Min 3 chars" } })}
                    placeholder="e.g. Full-Stack Web Developer"
                  />
                </Field>
                <Field label="Description">
                  <Textarea rows={3} {...register("description")} placeholder="What will learners achieve?" />
                </Field>
                <Field label="Thumbnail URL">
                  <Input type="url" {...register("thumbnail")} placeholder="https://…" />
                </Field>
                <Field label="Tags (comma separated)">
                  <Input placeholder="web, frontend, react" {...register("tags")} />
                </Field>
                <Field label="Status">
                  <Select {...register("status")}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                </Field>
                <Button type="submit" variant="gradient" className="w-full gap-2" loading={saving}>
                  {!saving && <><Save className="w-4 h-4" /> {isEdit ? "Save changes" : "Create roadmap"}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: course list */}
        {isEdit && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Courses <span className="text-muted-foreground text-sm font-normal">({courses.length})</span></h2>
              <Button size="sm" variant="gradient" className="gap-1.5" onClick={() => setAddCourse(true)}>
                <Plus className="w-3.5 h-3.5" /> Add course
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="flex flex-col items-center py-12 border border-dashed border-border rounded-2xl gap-3 text-center">
                <Map className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No courses yet. Add the first one.</p>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddCourse(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add course
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {[...courses].sort((a, b) => a.order - b.order).map((node, idx) => (
                  <div key={node.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <span className="w-6 h-6 rounded-lg bg-secondary text-center text-xs leading-6 text-muted-foreground font-medium shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                      {node.course?.thumbnail
                        ? <img src={node.course.thumbnail} className="w-full h-full object-cover" alt="" />
                        : <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{node.course?.title ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {node.course?.difficulty ?? "—"} · {node.course?.totalXp ?? 0} XP
                      </p>
                    </div>
                    <Button size="xs" variant="ghost" className="text-destructive shrink-0" onClick={() => handleRemoveCourse(node.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {addCourse && (
        <Modal title="Add course to roadmap" onClose={() => setAddCourse(false)}>
          <CoursePickerModal
            roadmapId={id}
            existingCourseIds={existingCourseIds}
            onClose={() => setAddCourse(false)}
            onAdded={(node) => setCourses((prev) => [...prev, node])}
          />
        </Modal>
      )}
    </div>
  );
}
