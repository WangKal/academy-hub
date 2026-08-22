import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useParams } from "@/lib/router";
import { ArrowDown, ArrowUp, Check, Plus, Save, Trash2, Upload, Users, Building2, Image as ImageIcon, FileVideo, ExternalLink } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Panel, Pill } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/services/permissions";
import * as api from "@/services/api";
import type { CourseLevel, Lesson, LessonAttachment, LessonType } from "@/types";

export const Route = createFileRoute("/_authenticated/instructor/courses_/$courseId")({
  beforeLoad: ({ context }) => {
    const user = (context as { user?: import("@/types").CurrentUser | null }).user;
    if (!user || !(can(user, "courses", "edit", { instructorId: user.id }) || (user.role === "admin" && can(user, "courses", "edit")))) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: CourseBuilder,
});

function CourseBuilder() {
  const { courseId } = useParams({ from: "/_authenticated/instructor/courses_/$courseId" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["builder-course", courseId] });
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["builder-course", courseId],
    queryFn: () => api.getCourse(courseId),
  });
  const { data: instructorUsers } = useQuery({
    queryKey: ["builder-instructors"],
    queryFn: () => api.getUsers({ role: "instructor", pageSize: 500 }),
  });
  const { data: organizations = [] } = useQuery({
    queryKey: ["builder-organizations"],
    queryFn: () => api.getOrganizations(),
  });
  const { data: allCohorts = [] } = useQuery({
    queryKey: ["builder-cohorts"],
    queryFn: () => api.getCohorts(),
  });
  const { data: courseCohorts = [] } = useQuery({
    queryKey: ["builder-course-cohorts", courseId],
    queryFn: () => api.getCourseCohorts(courseId),
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [form, setForm] = useState<Record<string, string> | null>(null);

  const values = form ?? {
    title: course?.title ?? "",
    shortDescription: course?.shortDescription ?? "",
    descriptionHtml: course?.descriptionHtml ?? "",
    category: course?.category ?? "",
    level: course?.level ?? "beginner",
    priceCents: String(course?.priceCents ?? 0),
    thumbnailUrl: course?.thumbnailUrl ?? "",
  };
  const set = (k: string, v: string) => setForm({ ...values, [k]: v });

  const editable = !!user && !!course && can(user, "courses", "edit", {
    instructorId: course.instructorIds?.includes(user.id) ? user.id : course.instructorId,
    resourceId: course.id,
  });
  const canAssign = !!user && !!course && (can(user, "courses", "assign", { instructorId: course.instructorIds?.includes(user.id) ? user.id : course.instructorId, resourceId: course.id }) || user.role === "admin");

  const save = useMutation({
    mutationFn: async () => {
      await api.updateCourse(courseId, {
        title: values.title,
        shortDescription: values.shortDescription,
        descriptionHtml: values.descriptionHtml,
        category: values.category,
        level: values.level as CourseLevel,
        priceCents: Number(values.priceCents) || 0,
        thumbnailUrl: values.thumbnailUrl || undefined,
      });
      await api.setCourseInstructors(courseId, course?.instructorIds?.length ? course.instructorIds : [user!.id]);
      await api.setCourseOrganizations(courseId, course?.organizationIds ?? []);
      await api.setCourseCohorts(courseId, courseCohorts.map((c) => c.id));
    },
    onSuccess: () => { invalidate(); toast.success("Course saved."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const addModule = useMutation({
    mutationFn: (title: string) => api.createModule({ courseId, title }),
    onSuccess: () => { invalidate(); toast.success("Module added."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const updateModule = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => api.updateModule(id, { title }),
    onSuccess: invalidate,
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const removeModule = useMutation({
    mutationFn: api.deleteModule,
    onSuccess: invalidate,
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const reorderModules = useMutation({
    mutationFn: api.reorderModules,
    onSuccess: invalidate,
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const addLesson = useMutation({
    mutationFn: (input: { moduleId: string; title: string; lessonType: LessonType }) =>
      api.createLesson({ ...input, status: "draft" }),
    onSuccess: (lesson) => { invalidate(); setSelectedLessonId(lesson.id); toast.success("Lesson added as draft."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const removeLesson = useMutation({
    mutationFn: api.deleteLesson,
    onSuccess: () => { setSelectedLessonId(null); invalidate(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const reorderLessons = useMutation({
    mutationFn: api.reorderLessons,
    onSuccess: invalidate,
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const selectedLesson = useMemo(
    () => course?.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId) ?? null,
    [course, selectedLessonId],
  );

  if (isLoading) return <AppShell title="Course builder"><LoadingBlock rows={6} /></AppShell>;
  if (error || !course) return <AppShell title="Course builder"><EmptyState title="Course not found" description={api.errorMessage(error)} /></AppShell>;

  const moveModule = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= course.modules.length) return;
    const ids = course.modules.map((m) => m.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    reorderModules.mutate(ids);
  };

  const moveLesson = (moduleLessons: Lesson[], index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= moduleLessons.length) return;
    const ids = moduleLessons.map((l) => l.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    reorderLessons.mutate(ids);
  };

  return (
    <AppShell
      title={course.title}
      description="Build the complete learning experience without editing raw database records."
      breadcrumb={<Link to="/instructor/courses" className="text-xs text-ink-3 hover:text-ink-1">Course builder</Link>}
      actions={<Button size="sm" disabled={!editable || save.isPending} onClick={() => save.mutate()}><Save className="size-4" />{save.isPending ? "Saving…" : "Save course"}</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Panel className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <div><h2 className="font-display text-base font-semibold">Course team & delivery</h2><p className="text-xs text-ink-4">Reusable relationship controls for instructors, organizations and cohorts.</p></div>
            </div>
            {canAssign && <div className="grid gap-5 md:grid-cols-2">
              <RelationshipChecklist
                label="Instructors"
                items={(instructorUsers?.items ?? []).map((u) => ({ id: u.id, label: u.fullName, detail: u.email }))}
                selected={course.instructorIds ?? [course.instructorId]}
                onChange={(ids) => api.setCourseInstructors(course.id, ids).then(invalidate).catch((e) => toast.error(api.errorMessage(e)))}
              />
              <RelationshipChecklist
                label="Organizations"
                items={organizations.map((o) => ({ id: o.id, label: o.name, detail: o.code }))}
                selected={course.organizationIds ?? []}
                onChange={(ids) => api.setCourseOrganizations(course.id, ids).then(invalidate).catch((e) => toast.error(api.errorMessage(e)))}
              />
              <RelationshipChecklist
                label="Cohorts"
                items={allCohorts.map((c) => ({ id: c.id, label: c.name, detail: c.organizationName ?? "Organization cohort" }))}
                selected={courseCohorts.map((c) => c.id)}
                onChange={(ids) => api.setCourseCohorts(course.id, ids).then(invalidate).catch((e) => toast.error(api.errorMessage(e)))}
              />
            </div>}
          </Panel>
          <Panel className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div><h2 className="font-display text-base font-semibold">Curriculum</h2><p className="text-xs text-ink-4">Course → modules → lessons → content.</p></div>
              <Pill variant="neutral">{course.modules.length} modules</Pill>
            </div>

            {course.modules.map((m, mi) => (
              <div key={m.id} className="rounded-xl border border-edge p-4">
                <div className="flex items-center gap-2">
                  <Input defaultValue={m.title} onBlur={(e) => e.target.value !== m.title && updateModule.mutate({ id: m.id, title: e.target.value })} className="font-medium" />
                  <Button variant="ghost" size="icon" disabled={mi === 0} onClick={() => moveModule(mi, -1)}><ArrowUp className="size-4" /></Button>
                  <Button variant="ghost" size="icon" disabled={mi === course.modules.length - 1} onClick={() => moveModule(mi, 1)}><ArrowDown className="size-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => removeModule.mutate(m.id)}><Trash2 className="size-4 text-rose-600" /></Button>
                </div>

                <div className="mt-3 space-y-2">
                  {m.lessons.map((l, li) => (
                    <div key={l.id} className={`flex items-center gap-2 rounded-lg border p-2 ${selectedLessonId === l.id ? "border-brand-500 bg-brand-500/5" : "border-edge"}`}>
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedLessonId(l.id)}>
                        <span className="block truncate text-sm font-medium">{l.title}</span>
                        <span className="text-[11px] text-ink-4">{l.lessonType} · {l.status}</span>
                      </button>
                      <Button variant="ghost" size="icon" disabled={li === 0} onClick={() => moveLesson(m.lessons, li, -1)}><ArrowUp className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" disabled={li === m.lessons.length - 1} onClick={() => moveLesson(m.lessons, li, 1)}><ArrowDown className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeLesson.mutate(l.id)}><Trash2 className="size-3.5 text-rose-600" /></Button>
                    </div>
                  ))}
                  <NewLessonForm pending={addLesson.isPending} onAdd={(title, lessonType) => addLesson.mutate({ moduleId: m.id, title, lessonType })} />
                </div>
              </div>
            ))}

            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!moduleTitle.trim()) return; addModule.mutate(moduleTitle.trim()); setModuleTitle(""); }}>
              <Input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="New module title" />
              <Button type="submit" variant="outline" disabled={addModule.isPending}><Plus className="size-4" /> Module</Button>
            </form>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">Course details</h2>
            <Field label="Title"><Input value={values.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Short description"><Textarea rows={3} value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></Field>
            <Field label="Description">
              <RichHtmlEditor value={values.descriptionHtml} onChange={(v) => set("descriptionHtml", v)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><Input value={values.category} onChange={(e) => set("category", e.target.value)} /></Field>
              <Field label="Level"><Select value={values.level} onValueChange={(v) => set("level", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (cents)"><Input inputMode="numeric" value={values.priceCents} onChange={(e) => set("priceCents", e.target.value)} /></Field>
              <Field label="Course thumbnail">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={values.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="Upload an image or paste a URL" />
                    <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-edge px-3 text-sm">
                      <ImageIcon className="size-4" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file=e.target.files?.[0]; if (!file) return; try { const url=await api.uploadCourseMedia(file,"thumbnails"); set("thumbnailUrl",url); toast.success("Thumbnail uploaded. Save the course to keep it."); } catch(err) { toast.error(api.errorMessage(err,"Thumbnail upload failed.")); } }} />
                    </label>
                  </div>
                  {values.thumbnailUrl && <img src={values.thumbnailUrl} alt="Course thumbnail preview" className="aspect-video w-full rounded-lg border border-edge object-cover" />}
                </div>
              </Field>
            </div>
          </Panel>

          {selectedLesson && <LessonEditor key={selectedLesson.id} lesson={selectedLesson} onSaved={invalidate} />}
        </div>
      </div>
    </AppShell>
  );
}

function RelationshipChecklist({
  label,
  items,
  selected,
  onChange,
}: {
  label: string;
  items: { id: string; label: string; detail?: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return <div>
    <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Building2 className="size-4" />{label}</div>
    <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-edge p-2">
      {items.map((item) => <label key={item.id} className="flex items-start gap-2 rounded p-2 text-xs hover:bg-surface-2">
        <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onChange(selected.includes(item.id) ? selected.filter((id) => id !== item.id) : [...selected, item.id])} />
        <span><span className="block font-medium">{item.label}</span>{item.detail && <span className="text-ink-4">{item.detail}</span>}</span>
      </label>)}
      {!items.length && <p className="p-2 text-xs text-ink-4">No records available.</p>}
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function NewLessonForm({ onAdd, pending }: { onAdd: (title: string, type: LessonType) => void; pending: boolean }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("text");
  return <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onAdd(title.trim(), type); setTitle(""); }}>
    <Input className="min-w-40 flex-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
    <Select value={type} onValueChange={(v) => setType(v as LessonType)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Text</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="assignment">Assignment</SelectItem></SelectContent></Select>
    <Button type="submit" variant="outline" size="sm" disabled={pending}><Plus className="size-4" /> Lesson</Button>
  </form>;
}

function RichHtmlEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [html, setHtml] = useState(value || "<p></p>");
  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
  };
  return <div className="overflow-hidden rounded-lg border border-edge">
    <div className="flex flex-wrap gap-1 border-b border-edge bg-surface-2 p-1">
      <Button type="button" variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}><b>B</b></Button>
      <Button type="button" variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}><i>I</i></Button>
      <Button type="button" variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("formatBlock", "h2")}>Heading</Button>
      <Button type="button" variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}>List</Button>
      <Button type="button" variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}>Numbered</Button>
      <Button type="button" variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("formatBlock", "p")}>Paragraph</Button>
    </div>
    <div
      contentEditable
      suppressContentEditableWarning
      className="min-h-56 p-4 text-sm leading-7 outline-none"
      dangerouslySetInnerHTML={{ __html: html }}
      onInput={(event) => setHtml(event.currentTarget.innerHTML)}
      onBlur={() => onChange(html)}
    />
    <p className="border-t border-edge px-3 py-2 text-[11px] text-ink-4">Format content visually; the learner sees the rendered result, not the underlying HTML.</p>
  </div>;
}

function LessonEditor({ lesson, onSaved }: { lesson: Lesson; onSaved: () => void }) {
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.contentHtml || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [attachments, setAttachments] = useState<LessonAttachment[]>(lesson.attachments ?? []);
  const [duration, setDuration] = useState(String(lesson.durationSeconds || 0));
  const [preview, setPreview] = useState(lesson.isPreview);
  const [status, setStatus] = useState(lesson.status);
  const save = useMutation({
    mutationFn: () => api.updateLesson(lesson.id, {
      title,
      contentHtml: content,
      videoUrl,
      attachments,
      durationSeconds: Number(duration) || 0,
      isPreview: preview,
      status,
    }),
    onSuccess: () => { onSaved(); toast.success("Lesson saved."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const upload = useMutation({
    mutationFn: (file: File) => api.uploadCourseMedia(file, "videos"),
    onSuccess: (url) => { setVideoUrl(url); toast.success("Video uploaded. Save the lesson to publish the URL."); },
    onError: (e) => toast.error(api.errorMessage(e, "Video upload failed.")),
  });
  const uploadAttachment = useMutation({
    mutationFn: async (file: File) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: await api.uploadCourseMedia(file, "attachments"),
    }),
    onSuccess: (attachment) => {
      setAttachments((items) => [...items, attachment]);
      toast.success("Attachment uploaded. Save the lesson to keep it.");
    },
    onError: (e) => toast.error(api.errorMessage(e, "Attachment upload failed.")),
  });

  const { data: assignment } = useQuery({ queryKey: ["assignment", lesson.id], queryFn: () => api.getAssignment(lesson.id), enabled: lesson.lessonType === "assignment" });
  const createAssignment = useMutation({
    mutationFn: () => api.createAssignment({ lessonId: lesson.id, title: lesson.title, instructionsHtml: "<p>Describe what the learner must submit.</p>" }),
    onSuccess: () => { toast.success("Assignment created."); onSaved(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const { data: quiz, refetch: refetchQuiz } = useQuery({
    queryKey: ["quiz-editor", lesson.id],
    queryFn: () => api.getQuiz(lesson.id, true),
    enabled: lesson.lessonType === "quiz",
    retry: false,
  });

  const createQuiz = useMutation({
    mutationFn: () => api.createQuiz({ lessonId: lesson.id, title: lesson.title, passingScorePercent: 70 }),
    onSuccess: async () => { await refetchQuiz(); toast.success("Quiz created."); onSaved(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return <Panel className="space-y-4 p-5">
    <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-base font-semibold">Lesson editor</h2><p className="text-xs text-ink-4">Author {lesson.lessonType} content without touching database fields.</p></div><Pill variant={status === "published" ? "success" : "neutral"}>{status}</Pill></div>
    <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Duration (seconds)"><Input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} /></Field>
      <Field label="Status"><Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></Field>
    </div>
    {(lesson.lessonType === "video" || videoUrl) && <div className="space-y-3"><Field label="Video (optional)"><div className="flex gap-2"><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL or upload a file" /><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-edge px-3 text-sm"><Upload className="size-4" /> Upload<input type="file" accept="video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload.mutate(file); }} /></label></div></Field>{videoUrl && <video src={videoUrl} controls className="aspect-video w-full rounded-lg bg-black object-contain" />}</div>}
    <Field label="Lesson content"><RichHtmlEditor value={content} onChange={setContent} /></Field>
    <div className="space-y-2">
      <div className="flex items-center justify-between"><Label>Attachments</Label><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-edge px-3 py-1.5 text-sm"><Upload className="size-4" /> Add file<input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadAttachment.mutate(file); }} /></label></div>
      {attachments.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{attachments.map((a, i) => { const isImage = a.type?.startsWith("image/"); const isVideo = a.type?.startsWith("video/"); return <div key={`${a.url}-${i}`} className="overflow-hidden rounded-lg border border-edge bg-surface-2">{isImage && <img src={a.url} alt={a.name} className="aspect-video w-full object-cover" />}{isVideo && <video src={a.url} controls className="aspect-video w-full bg-black object-contain" />}{!isImage && !isVideo && <div className="flex aspect-video items-center justify-center"><ExternalLink className="size-6 text-ink-4" /></div>}<div className="flex items-center gap-2 p-2 text-xs"><span className="min-w-0 flex-1 truncate">{a.name}</span><a href={a.url} target="_blank" rel="noreferrer" className="text-brand-600">Open</a><button type="button" className="text-rose-600" onClick={() => setAttachments((items) => items.filter((_, n) => n !== i))}>Remove</button></div></div>; })}</div>}
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} /> Allow as preview lesson</label>
    {lesson.lessonType === "assignment" && (
      <div className="rounded-lg border border-edge p-3">
        <div className="font-medium text-sm">Assignment</div>
        {assignment ? (
          <AssignmentEditor assignment={assignment} onSaved={onSaved} />
        ) : (
          <Button size="sm" variant="outline" className="mt-2" disabled={createAssignment.isPending} onClick={() => createAssignment.mutate()}>
            <Plus className="size-4" /> Create assignment
          </Button>
        )}
      </div>
    )}
    {lesson.lessonType === "quiz" && (
      <div className="rounded-lg border border-edge p-3">
        <div className="font-medium text-sm">Assessment</div>
        {!quiz ? (
          <Button size="sm" variant="outline" className="mt-2" disabled={createQuiz.isPending} onClick={() => createQuiz.mutate()}>
            <Plus className="size-4" /> Create quiz
          </Button>
        ) : (
          <QuizEditor quiz={quiz} onChanged={async () => { await refetchQuiz(); onSaved(); }} />
        )}
      </div>
    )}
    <Button onClick={() => save.mutate()} disabled={save.isPending}><Check className="size-4" />{save.isPending ? "Saving…" : "Save lesson"}</Button>
  </Panel>;
}

function QuizEditor({
  quiz,
  onChanged,
}: {
  quiz: Awaited<ReturnType<typeof api.getQuiz>>;
  onChanged: () => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [optionByQuestion, setOptionByQuestion] = useState<Record<string, string>>({});
  const [quizTitle, setQuizTitle] = useState(quiz.title);
  const [passingScore, setPassingScore] = useState(String(quiz.passingScorePercent));
  const [editingQuestions, setEditingQuestions] = useState<Record<string, string>>({});
  const [editingOptions, setEditingOptions] = useState<Record<string, string>>({});
  const updateQuiz = useMutation({
    mutationFn: () => api.updateQuiz(quiz.id, { title: quizTitle, passingScorePercent: Number(passingScore) || 70 }),
    onSuccess: onChanged,
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const deleteQuiz = useMutation({
    mutationFn: () => api.deleteQuiz(quiz.id),
    onSuccess: onChanged,
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const updateQuestion = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => api.updateQuizQuestion(id, text),
    onSuccess: async () => { setEditingQuestions({}); await onChanged(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const updateOption = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => api.updateQuizOption(id, text),
    onSuccess: async () => { setEditingOptions({}); await onChanged(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const addQuestion = useMutation({
    mutationFn: () => api.createQuizQuestion(quiz.id, question.trim()),
    onSuccess: async () => { setQuestion(""); await onChanged(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const addOption = useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) => api.createQuizOption(questionId, text),
    onSuccess: async () => { setOptionByQuestion({}); await onChanged(); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const reorderQuestions = useMutation({
    mutationFn: api.reorderQuizQuestions,
    onSuccess: onChanged,
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_160px_auto]">
        <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Assessment title" />
        <Input inputMode="numeric" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} placeholder="Passing %" />
        <div className="flex gap-1"><Button size="sm" variant="outline" disabled={updateQuiz.isPending} onClick={() => updateQuiz.mutate()}>Save settings</Button><Button size="sm" variant="ghost" disabled={deleteQuiz.isPending} onClick={() => deleteQuiz.mutate()}><Trash2 className="size-3.5 text-rose-600" /></Button></div>
      </div>
      <div className="flex gap-2">
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="New question" />
        <Button size="sm" disabled={!question.trim() || addQuestion.isPending} onClick={() => addQuestion.mutate()}>
          <Plus className="size-4" /> Question
        </Button>
      </div>
      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="rounded-lg bg-surface-2 p-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-ink-4">{qi + 1}.</span>
              <div className="flex gap-0.5">
                <button type="button" className="text-ink-4 disabled:opacity-30" disabled={qi === 0 || reorderQuestions.isPending} onClick={() => { const ids = quiz.questions.map((item) => item.id); [ids[qi - 1], ids[qi]] = [ids[qi]!, ids[qi - 1]!]; reorderQuestions.mutate(ids); }}>↑</button>
                <button type="button" className="text-ink-4 disabled:opacity-30" disabled={qi === quiz.questions.length - 1 || reorderQuestions.isPending} onClick={() => { const ids = quiz.questions.map((item) => item.id); [ids[qi], ids[qi + 1]] = [ids[qi + 1]!, ids[qi]!]; reorderQuestions.mutate(ids); }}>↓</button>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex gap-2"><Input value={editingQuestions[q.id] ?? q.questionText} onChange={(e) => setEditingQuestions((state) => ({ ...state, [q.id]: e.target.value }))} /><Button size="sm" variant="ghost" disabled={!editingQuestions[q.id]?.trim() || updateQuestion.isPending} onClick={() => updateQuestion.mutate({ id: q.id, text: editingQuestions[q.id]!.trim() })}>Save</Button></div>
              <div className="mt-2 space-y-1">
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      className={`size-3 rounded-full border ${o.isCorrect ? "bg-primary" : ""}`}
                      title={o.isCorrect ? "Correct option" : "Set as correct"}
                      onClick={async () => { await api.setCorrectOption(q.id, o.id); await onChanged(); }}
                    />
                    <Input className="h-7 flex-1" value={editingOptions[o.id] ?? o.optionText} onChange={(e) => setEditingOptions((state) => ({ ...state, [o.id]: e.target.value }))} onBlur={() => { const text = editingOptions[o.id]?.trim(); if (text && text !== o.optionText) updateOption.mutate({ id: o.id, text }); }} />
                    <button type="button" className="ml-auto text-rose-600" onClick={async () => { await api.deleteQuizOption(o.id); await onChanged(); }}>
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={optionByQuestion[q.id] ?? ""}
                  onChange={(e) => setOptionByQuestion((s) => ({ ...s, [q.id]: e.target.value }))}
                  placeholder="Answer option"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!optionByQuestion[q.id]?.trim() || addOption.isPending}
                  onClick={() => addOption.mutate({ questionId: q.id, text: optionByQuestion[q.id]!.trim() })}
                >
                  <Plus className="size-3" /> Option
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={async () => { await api.deleteQuizQuestion(q.id); await onChanged(); }}>
              <Trash2 className="size-3.5 text-rose-600" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssignmentEditor({
  assignment,
  onSaved,
}: {
  assignment: NonNullable<Awaited<ReturnType<typeof api.getAssignment>>>;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [instructions, setInstructions] = useState(assignment.instructionsHtml);
  const [maxScore, setMaxScore] = useState(String(assignment.maxScore ?? ""));
  const [dueDate, setDueDate] = useState(assignment.dueDate ? assignment.dueDate.slice(0, 16) : "");
  const save = useMutation({
    mutationFn: () => api.updateAssignment(assignment.id, {
      title,
      instructionsHtml: instructions,
      maxScore: maxScore ? Number(maxScore) : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    }),
    onSuccess: () => { onSaved(); toast.success("Assignment saved."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <div className="mt-3 space-y-3">
      <Field label="Assignment title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Instructions"><RichHtmlEditor value={instructions} onChange={setInstructions} /></Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Maximum score"><Input inputMode="numeric" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} placeholder="100" /></Field><Field label="Due date"><Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field></div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="size-4" /> {save.isPending ? "Saving…" : "Save assignment"}
        </Button>
        <Button size="sm" variant="ghost" onClick={async () => { await api.deleteAssignment(assignment.id); onSaved(); toast.success("Assignment deleted."); }}>
          <Trash2 className="size-4 text-rose-600" /> Delete assignment
        </Button>
      </div>
    </div>
  );
}
