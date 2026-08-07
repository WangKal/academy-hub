import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, Circle, FileText, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, LoadingBlock, formatDuration } from "@/components/layout/States";
import { QuizRunner } from "@/components/learning/QuizRunner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";
import type { Lesson } from "@/types";

export const Route = createFileRoute("/_authenticated/learn/$courseId")({
  head: () => ({
    meta: [
      { title: "Course player — EA Academy" },
      { name: "description", content: "Work through your EA Academy course lesson by lesson." },
      { property: "og:title", content: "Course player — EA Academy" },
      { property: "og:description", content: "Work through your EA Academy course." },
    ],
  }),
  component: Player,
});

function Player() {
  const { courseId } = useParams({ from: "/_authenticated/learn/$courseId" });
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => api.getCourse(courseId),
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", courseId],
    queryFn: () => api.getLessonProgressForCourse(courseId),
  });

  const { data: courseProgress } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => api.getCourseProgress(courseId),
  });

  const lessons: Lesson[] = useMemo(
    () => (course?.modules ?? []).flatMap((m) => m.lessons),
    [course],
  );

  useEffect(() => {
    if (!activeId && lessons.length) {
      const done = new Set(
        (progress ?? []).filter((p) => p.status === "completed").map((p) => p.lessonId),
      );
      setActiveId(lessons.find((l) => !done.has(l.id))?.id ?? lessons[0]!.id);
    }
  }, [activeId, lessons, progress]);

  const active = lessons.find((l) => l.id === activeId) ?? null;
  const completed = new Set(
    (progress ?? []).filter((p) => p.status === "completed").map((p) => p.lessonId),
  );

  const complete = useMutation({
    mutationFn: async (lessonId: string) => {
      await api.markLessonComplete(lessonId);
      return api.syncCourseCompletion(courseId);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["lesson-progress", courseId] });
      qc.invalidateQueries({ queryKey: ["course-progress", courseId] });
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      if (res.completed) {
        qc.invalidateQueries({ queryKey: ["my-certificates"] });
        toast.success("Course complete — your certificate has been issued.");
      } else {
        toast.success("Lesson marked complete.");
      }
      const idx = lessons.findIndex((l) => l.id === activeId);
      const next = lessons[idx + 1];
      if (next) setActiveId(next.id);
    },
    onError: (e) => toast.error(api.errorMessage(e, "Could not save your progress.")),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <LoadingBlock rows={4} />
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <EmptyState title="Course unavailable" description={api.errorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-80 shrink-0 border-r border-border bg-secondary/30 lg:block">
        <div className="border-b border-border p-4">
          <Link
            to="/my-courses"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" /> My courses
          </Link>
          <h2 className="mt-3 font-display text-base leading-snug">{course.title}</h2>
          <Progress value={courseProgress?.percent ?? 0} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">
            {courseProgress?.lessonsCompleted ?? 0}/{courseProgress?.lessonsTotal ?? 0} lessons
            complete
          </p>
        </div>
        <nav className="p-3">
          {course.modules.map((m, mi) => (
            <div key={m.id} className="mb-5">
              <p className="px-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {String(mi + 1).padStart(2, "0")} · {m.title}
              </p>
              <ul className="mt-2 space-y-0.5">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveId(l.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                        l.id === activeId
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary",
                      )}
                    >
                      {completed.has(l.id) ? (
                        <CheckCircle2 className="size-4 shrink-0 text-accent" />
                      ) : (
                        <Circle className="size-4 shrink-0 opacity-40" />
                      )}
                      <span className="flex-1 truncate">{l.title}</span>
                      <span className="text-xs opacity-60">
                        {formatDuration(l.durationSeconds)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10">
          {!active ? (
            <EmptyState title="This course has no lessons yet" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {active.lessonType}
                </Badge>
                {completed.has(active.id) && <Badge>Completed</Badge>}
              </div>
              <h1 className="mt-4 text-3xl leading-tight">{active.title}</h1>

              {active.lessonType === "video" && active.videoUrl && (
                <div className="mt-6 aspect-video overflow-hidden rounded-md border border-border bg-primary/5">
                  <iframe
                    src={active.videoUrl}
                    title={active.title}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {active.lessonType === "quiz" ? (
                <QuizRunner
                  lessonId={active.id}
                  onPassed={() => {
                    qc.invalidateQueries({ queryKey: ["lesson-progress", courseId] });
                    qc.invalidateQueries({ queryKey: ["course-progress", courseId] });
                  }}
                />
              ) : (
                <>
                  <div
                    className="prose prose-slate mt-6 max-w-none text-muted-foreground [&_h2]:mt-8 [&_h2]:text-foreground [&_li]:mt-1 [&_p]:mt-4 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: active.contentHtml || "<p>No content yet.</p>" }}
                  />
                  <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
                    <Button
                      disabled={complete.isPending || completed.has(active.id)}
                      onClick={() => complete.mutate(active.id)}
                    >
                      {completed.has(active.id) ? "Completed" : "Mark complete & continue"}
                    </Button>
                    {active.lessonType === "video" ? (
                      <PlayCircle className="size-4 text-muted-foreground" />
                    ) : (
                      <FileText className="size-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(active.durationSeconds)}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
