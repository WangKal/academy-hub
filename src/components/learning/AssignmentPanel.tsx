import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/services/api";

export function AssignmentPanel({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const { data: submission, isLoading } = useQuery({
    queryKey: ["assignment-submission", lessonId],
    queryFn: () => api.getMyAssignmentSubmission(lessonId),
  });

  const submit = useMutation({
    mutationFn: () =>
      api.submitAssignment({
        lessonId,
        contentText: text || submission?.contentText || "",
        attachmentUrl: url || submission?.attachmentUrl,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignment-submission", lessonId] });
      toast.success("Assignment submitted for review.");
    },
    onError: (e) => toast.error(api.errorMessage(e, "Could not submit your assignment.")),
  });

  if (isLoading) return null;

  const graded = submission?.status === "graded";

  return (
    <div className="mt-8 rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Your submission</h2>
        {submission && (
          <Badge variant={graded ? "default" : "secondary"} className="capitalize">
            {submission.status}
          </Badge>
        )}
      </div>

      {graded ? (
        <div className="mt-4 space-y-2">
          <p className="text-3xl font-display">{submission.grade ?? 0}%</p>
          <p className="text-sm text-muted-foreground">
            {submission.feedback || "No written feedback was left."}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Graded {formatDate(submission.gradedAt)}
          </p>
          <div className="mt-3 rounded-sm border border-border bg-secondary/30 p-3 text-sm whitespace-pre-wrap">
            {submission.contentText}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-text">Your response</Label>
            <Textarea
              id="assignment-text"
              rows={8}
              placeholder="Write your answer here…"
              value={text || submission?.contentText || ""}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-url">Attachment link (optional)</Label>
            <Input
              id="assignment-url"
              placeholder="https://…"
              value={url || submission?.attachmentUrl || ""}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button disabled={submit.isPending} onClick={() => submit.mutate()}>
            {submission ? "Resubmit" : "Submit for review"}
          </Button>
          {submission && (
            <p className="text-xs text-muted-foreground">
              Submitted {formatDate(submission.submittedAt)} — awaiting grading.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
