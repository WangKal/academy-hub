import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Panel, Pill } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/services/api";
import type { CourseLevel, LessonType } from "@/types";

export const Route = createFileRoute("/_authenticated/instructor/courses_/$courseId")({
  head: () => ({
    meta: [
      { title: "Edit course — EA Academy" },
      { name: "description", content: "Edit course details, modules and lessons." },
      { property: "og:title", content: "Edit course — EA Academy" },
      { property: "og:description", content: "Course builder for EA Academy instructors." },
    ],
  }),
  component: CourseBuilder,
});

function CourseBuilder() {
  const { courseId } = useParams({ from: "/_authenticated/instructor/courses_/$courseId" });
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["builder-course", courseId] });

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["builder-course", courseId],
    queryFn: () => api.getCourse(courseId),
  });

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

  const save = useMutation({
    mutationFn: () =>
      api.updateCourse(courseId, {
        title: values.title,
        shortDescription: values.shortDescription,
        descriptionHtml: values.descriptionHtml,
        category: values.category,
        level: values.level as CourseLevel,
        priceCents: Number(values.priceCents) || 0,
        thumbnailUrl: values.thumbnailUrl || undefined,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Course saved.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const addModule = useMutation({
    mutationFn: (title: string) => api.createModule({ courseId, title }),
    onSuccess: () => {
      invalidate();
      toast.success("Module added.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const removeModule = useMutation({
    mutationFn: (id: string) => api.deleteModule(id),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const addLesson = useMutation({
    mutationFn: (input: { moduleId: string; title: string; lessonType: LessonType }) =>
      api.createLesson(input),
    onSuccess: () => {
      invalidate();
      toast.success("Lesson added.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const removeLesson = useMutation({
    mutationFn: (id: string) => api.deleteLesson(id),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const [moduleTitle, setModuleTitle] = useState("");

  return (
    <AppShell
      title={course?.title ?? "Course builder"}
      description="Edit details, modules and lessons"
      breadcrumb={
        <nav className="text-xs text-ink-4">
          <Link to="/instructor/courses" className="hover:text-ink-2">
            Course builder
          </Link>{" "}
          / <span className="text-ink-3">Edit</span>
        </nav>
      }
      actions={
        <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      }
    >
      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : error || !course ? (
        <EmptyState title="Course not found" description={api.errorMessage(error)} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Panel className="space-y-4 p-5">
              <h2 className="font-display text-base font-semibold text-ink-1">Curriculum</h2>

              {course.modules.map((m, i) => (
                <div key={m.id} className="rounded-lg border border-edge p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium text-ink-1">
                      <span className="mr-2 font-mono text-xs text-ink-4">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {m.title}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete module ${m.title}`}
                      onClick={() => removeModule.mutate(m.id)}
                    >
                      <Trash2 className="size-4 text-rose-600" />
                    </Button>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {m.lessons.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-center gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm"
                      >
                        <Pill variant="neutral">{l.lessonType}</Pill>
                        <span className="min-w-0 flex-1 truncate text-ink-2">{l.title}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete lesson ${l.title}`}
                          onClick={() => removeLesson.mutate(l.id)}
                        >
                          <Trash2 className="size-3.5 text-rose-600" />
                        </Button>
                      </li>
                    ))}
                    {!m.lessons.length && (
                      <li className="px-1 text-xs text-ink-4">No lessons yet.</li>
                    )}
                  </ul>

                  <NewLessonForm
                    pending={addLesson.isPending}
                    onAdd={(title, lessonType) =>
                      addLesson.mutate({ moduleId: m.id, title, lessonType })
                    }
                  />
                </div>
              ))}

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!moduleTitle.trim()) return;
                  addModule.mutate(moduleTitle.trim());
                  setModuleTitle("");
                }}
              >
                <Input
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="New module title"
                  aria-label="New module title"
                />
                <Button type="submit" variant="outline" disabled={addModule.isPending}>
                  <Plus className="size-4" /> Module
                </Button>
              </form>
            </Panel>
          </div>

          <Panel className="h-fit space-y-4 p-5">
            <h2 className="font-display text-base font-semibold text-ink-1">Course details</h2>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="short">Short description</Label>
              <Textarea
                id="short"
                rows={3}
                value={values.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Full description (HTML)</Label>
              <Textarea
                id="desc"
                rows={6}
                value={values.descriptionHtml}
                onChange={(e) => set("descriptionHtml", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat">Category</Label>
              <Input id="cat" value={values.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="level">Level</Label>
              <Select value={values.level} onValueChange={(v) => set("level", v)}>
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (cents)</Label>
              <Input
                id="price"
                inputMode="numeric"
                value={values.priceCents}
                onChange={(e) => set("priceCents", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thumb">Thumbnail URL</Label>
              <Input
                id="thumb"
                value={values.thumbnailUrl}
                onChange={(e) => set("thumbnailUrl", e.target.value)}
              />
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}

function NewLessonForm({
  onAdd,
  pending,
}: {
  onAdd: (title: string, type: LessonType) => void;
  pending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("text");
  return (
    <form
      className="mt-3 flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim(), type);
        setTitle("");
      }}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New lesson title"
        aria-label="New lesson title"
        className="min-w-40 flex-1"
      />
      <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="quiz">Quiz</SelectItem>
          <SelectItem value="assignment">Assignment</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        <Plus className="size-4" /> Lesson
      </Button>
    </form>
  );
}
