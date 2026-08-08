import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/instructor/submissions")({
  head: () => ({
    meta: [
      { title: "Assignment reviews — EA Academy" },
      { name: "description", content: "Grade learner assignment submissions and leave feedback." },
      { property: "og:title", content: "Assignment reviews — EA Academy" },
      { property: "og:description", content: "Grade learner assignments at EA Academy." },
    ],
  }),
  component: Submissions,
});

function Submissions() {
  const qc = useQueryClient();
  const [grades, setGrades] = useState<Record<string, { grade: string; feedback: string }>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["assignment-submissions"],
    queryFn: () => api.getAssignmentSubmissions(),
  });

  const grade = useMutation({
    mutationFn: (v: { id: string; grade: number; feedback: string }) =>
      api.gradeAssignment(v.id, v.grade, v.feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignment-submissions"] });
      toast.success("Submission graded — the learner has been notified.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell title="Assignment reviews" description="Grade submitted work and send feedback">
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load submissions" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState title="No submissions yet" description="Learner submissions appear here." />
      ) : (
        <div className="space-y-4">
          {data.map((s) => {
            const local = grades[s.id] ?? {
              grade: String(s.grade ?? ""),
              feedback: s.feedback ?? "",
            };
            return (
              <div key={s.id} className="rounded-md border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.userName ?? "Learner"}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.courseTitle} · {s.lessonTitle} · {formatDate(s.submittedAt)}
                    </p>
                  </div>
                  <Badge variant={s.status === "graded" ? "default" : "secondary"} className="capitalize">
                    {s.status}
                  </Badge>
                </div>

                <div className="mt-4 whitespace-pre-wrap rounded-sm border border-border bg-secondary/30 p-3 text-sm">
                  {s.contentText || "No written response."}
                </div>
                {s.attachmentUrl && (
                  <a
                    href={s.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs underline"
                  >
                    View attachment
                  </a>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_auto] md:items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor={`g-${s.id}`}>Score %</Label>
                    <Input
                      id={`g-${s.id}`}
                      type="number"
                      min={0}
                      max={100}
                      value={local.grade}
                      onChange={(e) =>
                        setGrades((g) => ({ ...g, [s.id]: { ...local, grade: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`f-${s.id}`}>Feedback</Label>
                    <Textarea
                      id={`f-${s.id}`}
                      rows={2}
                      value={local.feedback}
                      onChange={(e) =>
                        setGrades((g) => ({ ...g, [s.id]: { ...local, feedback: e.target.value } }))
                      }
                    />
                  </div>
                  <Button
                    disabled={grade.isPending || local.grade === ""}
                    onClick={() =>
                      grade.mutate({
                        id: s.id,
                        grade: Number(local.grade),
                        feedback: local.feedback,
                      })
                    }
                  >
                    Save grade
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
