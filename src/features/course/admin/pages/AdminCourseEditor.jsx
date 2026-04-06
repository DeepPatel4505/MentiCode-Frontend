import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { ChevronLeft, Plus, Pencil, Trash2, Eye, Save, Zap, GripVertical } from "lucide-react";
import {
  createCourse, updateCourse, createSection, createLesson, createGameLevel,
  selectAdminSaving, selectAdminError, clearError,
} from "@/app/store/slices/adminSlice";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Card, CardContent, Field, Badge, Skeleton } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// ── Modal wrapper ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Section modal ─────────────────────────────────────────────
function SectionModal({ courseId, onClose, onCreated }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { type: "video_section", isSkippable: true, order: 1 } });

  const onSubmit = async (data) => {
    const res = await dispatch(createSection({ courseId, data: { ...data, order: Number(data.order) } }));
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Section created", type: "success" });
      onCreated(res.payload);
      onClose();
    } else toast({ title: "Error", description: res.payload, type: "error" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Title *" error={errors.title?.message}>
        <Input {...register("title", { required: "Required" })} placeholder="e.g. Introduction to HTML" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Order *">
          <Input type="number" min={1} {...register("order", { required: true, valueAsNumber: true })} />
        </Field>
        <Field label="Type">
          <Select {...register("type")}>
            <option value="video_section">Video section</option>
            <option value="challenge_section">Challenge section</option>
          </Select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" defaultChecked {...register("isSkippable")} className="rounded" />
        Allow students to skip this section
      </label>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="gradient">Create section</Button>
      </div>
    </form>
  );
}

// ── Lesson modal ──────────────────────────────────────────────
function LessonModal({ sectionId, onClose, onCreated }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({ defaultValues: { type: "video", order: 1, duration: 0, isPreview: false } });

  const onSubmit = async (data) => {
    const res = await dispatch(createLesson({ sectionId, data: { ...data, order: Number(data.order), duration: Number(data.duration) } }));
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Lesson created", type: "success" });
      onCreated && onCreated(res.payload);
      onClose();
    } else toast({ title: "Error", description: res.payload, type: "error" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Title *">
        <Input {...register("title", { required: true })} placeholder="Lesson title" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Order *">
          <Input type="number" min={1} {...register("order", { required: true, valueAsNumber: true })} />
        </Field>
        <Field label="Type">
          <Select {...register("type")}>
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="attachment">Attachment</option>
          </Select>
        </Field>
      </div>
      <Field label="Video URL">
        <Input type="url" placeholder="https://…" {...register("videoUrl")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Duration (seconds)">
          <Input type="number" min={0} {...register("duration", { valueAsNumber: true })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" {...register("isPreview")} className="rounded" />
        Free preview (no enrollment required)
      </label>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="gradient">Create lesson</Button>
      </div>
    </form>
  );
}

// ── Level modal ───────────────────────────────────────────────
function LevelModal({ sectionId, onClose, onCreated }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: { type: "quiz", order: 1, xpReward: 10, passingScore: 70, cooldownMinutes: 5, isPublished: false, config: '{"questions":[]}' },
  });

  const onSubmit = async (data) => {
    let config = {};
    try { config = JSON.parse(data.config); } catch (_) { config = { questions: [] }; }
    const res = await dispatch(createGameLevel({
      sectionId,
      data: { ...data, order: Number(data.order), xpReward: Number(data.xpReward), passingScore: Number(data.passingScore), cooldownMinutes: Number(data.cooldownMinutes), config },
    }));
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Level created", type: "success" });
      onCreated && onCreated(res.payload);
      onClose();
    } else toast({ title: "Error", description: res.payload, type: "error" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Title *">
        <Input {...register("title", { required: true })} placeholder="Level title" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Order *">
          <Input type="number" min={1} {...register("order", { required: true, valueAsNumber: true })} />
        </Field>
        <Field label="XP reward">
          <Input type="number" min={0} {...register("xpReward", { valueAsNumber: true })} />
        </Field>
        <Field label="Pass score %">
          <Input type="number" min={0} max={100} {...register("passingScore", { valueAsNumber: true })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select {...register("type")}>
            <option value="quiz">Quiz</option>
            <option value="drag_drop">Drag & drop</option>
            <option value="code_challenge">Code challenge</option>
            <option value="fill_blank">Fill blank</option>
          </Select>
        </Field>
        <Field label="Cooldown (min)">
          <Input type="number" min={0} {...register("cooldownMinutes", { valueAsNumber: true })} />
        </Field>
      </div>
      <Field label="Config JSON (questions array)">
        <Textarea rows={5} className="font-mono text-xs" {...register("config")}
          placeholder='{"questions":[{"id":"q1","text":"What is HTML?","options":["A markup language","A programming language"],"correctAnswer":"A markup language"}]}' />
      </Field>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" {...register("isPublished")} className="rounded" />
        Publish immediately (visible to students)
      </label>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="gradient">Create level</Button>
      </div>
    </form>
  );
}

// ── Section row ───────────────────────────────────────────────
function SectionRow({ section, courseId, onRefresh }) {
  const { toast } = useToast();
  const [expanded,  setExpanded]  = useState(true);
  const [addLesson, setAddLesson] = useState(false);
  const [addLevel,  setAddLevel]  = useState(false);
  const [lessons,   setLessons]   = useState([]);
  const [levels,    setLevels]    = useState([]);

  useEffect(() => {
    api.get(`/sections/${section.id}/lessons`).then((r) => setLessons(r.data.data.lessons ?? [])).catch(() => {});
    api.get(`/sections/${section.id}/levels`).then((r) => setLevels(r.data.data.levels ?? [])).catch(() => {});
  }, [section.id]);

  const deleteSection = async () => {
    if (!confirm("Delete this section and all its content?")) return;
    try {
      await api.delete(`/courses/${courseId}/sections/${section.id}`);
      toast({ title: "Section deleted", type: "info" });
      onRefresh();
    } catch (err) { toast({ title: "Error", description: err.response?.data?.message, type: "error" }); }
  };

  const deleteLesson = async (id) => {
    try { await api.delete(`/lessons/${id}`); setLessons((prev) => prev.filter((l) => l.id !== id)); toast({ title: "Lesson deleted", type: "info" }); }
    catch (err) { toast({ title: "Error", description: err.response?.data?.message, type: "error" }); }
  };

  const deleteLevel = async (id) => {
    try { await api.delete(`/levels/${id}`); setLevels((prev) => prev.filter((l) => l.id !== id)); toast({ title: "Level deleted", type: "info" }); }
    catch (err) { toast({ title: "Error", description: err.response?.data?.message, type: "error" }); }
  };

  return (
    <>
      <div className="rounded-2xl border border-border overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 p-4 bg-card">
          <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            section.type === "challenge_section" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}>{section.order}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{section.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{section.type.replace("_", " ")}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="xs" variant="ghost" className="text-destructive" onClick={deleteSection}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setExpanded(!expanded)} className="text-muted-foreground text-xs">
              {expanded ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border p-4 space-y-3 bg-background/30">
            {/* Lessons */}
            {section.type === "video_section" && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Lessons</p>
                <div className="space-y-1.5">
                  {lessons.map((l) => (
                    <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card text-sm">
                      <span className="w-5 h-5 rounded bg-secondary text-center text-xs leading-5 text-muted-foreground font-medium shrink-0">{l.order}</span>
                      <span className="flex-1 truncate">{l.title}</span>
                      <span className="text-xs text-muted-foreground capitalize shrink-0">{l.type}</span>
                      <Button size="xs" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteLesson(l.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button size="xs" variant="outline" className="mt-2 gap-1.5 w-full" onClick={() => setAddLesson(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add lesson
                </Button>
              </div>
            )}

            {/* Levels */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Game levels</p>
              <div className="space-y-1.5">
                {levels.map((lv) => (
                  <div key={lv.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card text-sm">
                    <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="flex-1 truncate">{lv.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{lv.xpReward} XP</span>
                    <Badge variant={lv.isPublished ? "success" : "warning"} className="shrink-0">{lv.isPublished ? "Live" : "Draft"}</Badge>
                    <Button size="xs" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteLevel(lv.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="xs" variant="outline" className="mt-2 gap-1.5 w-full" onClick={() => setAddLevel(true)}>
                <Plus className="w-3.5 h-3.5" /> Add game level
              </Button>
            </div>
          </div>
        )}
      </div>

      {addLesson && (
        <Modal title="Add lesson" onClose={() => setAddLesson(false)}>
          <LessonModal sectionId={section.id} onClose={() => setAddLesson(false)} onCreated={(l) => setLessons((prev) => [...prev, l])} />
        </Modal>
      )}
      {addLevel && (
        <Modal title="Add game level" onClose={() => setAddLevel(false)}>
          <LevelModal sectionId={section.id} onClose={() => setAddLevel(false)} onCreated={(lv) => setLevels((prev) => [...prev, lv])} />
        </Modal>
      )}
    </>
  );
}

// ── Main editor ───────────────────────────────────────────────
export default function AdminCourseEditor() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const saving    = useSelector(selectAdminSaving);
  const isEdit    = !!id;

  const [course,   setCourse]   = useState(null);
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(isEdit);
  const [addSection, setAddSection] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { difficulty: "beginner", language: "en", freeUpToLesson: "", freeUpToLevel: "" },
  });

  useEffect(() => {
    if (!isEdit) return;
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/sections`),
    ]).then(([cr, sr]) => {
      const c = cr.data.data.course;
      setCourse(c);
      setSections(sr.data.data.sections ?? []);
      reset({
        title:          c.title,
        description:    c.description,
        thumbnail:      c.thumbnail,
        difficulty:     c.difficulty,
        language:       c.language,
        tags:           c.tags?.join(", "),
        freeUpToLesson: c.freeUpToLesson ?? "",
        freeUpToLevel:  c.freeUpToLevel  ?? "",
      });
    }).catch(() => toast({ title: "Failed to load course", type: "error" }))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    const tags = typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : data.tags ?? [];
    const payload = {
      ...data,
      tags,
      freeUpToLesson: data.freeUpToLesson === "" ? null : Number(data.freeUpToLesson),
      freeUpToLevel:  data.freeUpToLevel  === "" ? null : Number(data.freeUpToLevel),
    };

    if (isEdit) {
      const res = await dispatch(updateCourse({ id, data: payload }));
      if (res.meta.requestStatus === "fulfilled") toast({ title: "Course updated!", type: "success" });
      else toast({ title: "Error", description: res.payload, type: "error" });
    } else {
      const res = await dispatch(createCourse(payload));
      if (res.meta.requestStatus === "fulfilled") {
        toast({ title: "Course created!", type: "success" });
        navigate(`/admin/courses/${res.payload.id}/edit`);
      } else toast({ title: "Error", description: res.payload, type: "error" });
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64 rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/courses" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Courses
        </Link>
        {isEdit && course && (
          <Badge variant={course.status === "published" ? "success" : "warning"}>{course.status}</Badge>
        )}
        {isEdit && course && (
          <Button size="xs" variant="ghost" className="ml-auto" asChild>
            <Link to={`/courses/${course.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /> Preview</Link>
          </Button>
        )}
      </div>

      <h1 className="text-2xl font-bold">{isEdit ? "Edit course" : "New course"}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-4">Course details</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Field label="Title *" error={errors.title?.message}>
                  <Input {...register("title", { required: "Title is required", minLength: { value: 3, message: "Min 3 chars" } })} placeholder="Course title" />
                </Field>
                <Field label="Description">
                  <Textarea rows={3} {...register("description")} placeholder="What will students learn?" />
                </Field>
                <Field label="Thumbnail URL">
                  <Input type="url" {...register("thumbnail")} placeholder="https://…" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Difficulty">
                    <Select {...register("difficulty")}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Select>
                  </Field>
                  <Field label="Language">
                    <Input placeholder="en" maxLength={5} {...register("language")} />
                  </Field>
                </div>
                <Field label="Tags (comma separated)">
                  <Input placeholder="html, css, web" {...register("tags")} />
                </Field>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Freemium</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Free lessons">
                      <Input type="number" min={0} placeholder="null = all free" {...register("freeUpToLesson")} />
                    </Field>
                    <Field label="Free levels">
                      <Input type="number" min={0} placeholder="null = all free" {...register("freeUpToLevel")} />
                    </Field>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Leave blank = fully free. 0 = Pro only.</p>
                </div>
                <Button type="submit" variant="gradient" className="w-full gap-2" loading={saving}>
                  {!saving && <><Save className="w-4 h-4" /> {isEdit ? "Save changes" : "Create course"}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sections editor */}
        {isEdit && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Sections & content</h2>
              <Button size="sm" variant="gradient" className="gap-1.5" onClick={() => setAddSection(true)}>
                <Plus className="w-3.5 h-3.5" /> Add section
              </Button>
            </div>

            {sections.length === 0 ? (
              <div className="flex flex-col items-center py-12 border border-dashed border-border rounded-2xl gap-3 text-center">
                <p className="text-muted-foreground text-sm">No sections yet. Add the first one.</p>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddSection(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add section
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((s) => (
                  <SectionRow key={s.id} section={s} courseId={id} onRefresh={() => {
                    api.get(`/courses/${id}/sections`).then((r) => setSections(r.data.data.sections ?? []));
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {addSection && (
        <Modal title="Add section" onClose={() => setAddSection(false)}>
          <SectionModal courseId={id} onClose={() => setAddSection(false)} onCreated={(s) => setSections((prev) => [...prev, s])} />
        </Modal>
      )}
    </div>
  );
}
