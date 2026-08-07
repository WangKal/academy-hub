import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, LoadingBlock } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";
import type { QuizResult } from "@/types";

export function QuizRunner({
  lessonId,
  onPassed,
}: {
  lessonId: string;
  onPassed?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: () => api.getQuiz(lessonId),
  });

  const submit = useMutation({
    mutationFn: () => api.submitQuizAttempt(quiz!.id, answers),
    onSuccess: (res) => {
      setResult(res);
      if (res.attempt.passed) {
        toast.success(`Passed with ${res.attempt.scorePercent}%`);
        onPassed?.();
      } else {
        toast.error(`Scored ${res.attempt.scorePercent}% — ${res.passingScorePercent}% needed.`);
      }
    },
    onError: (e) => toast.error(api.errorMessage(e, "Could not submit your answers.")),
  });

  if (isLoading) return <LoadingBlock rows={3} />;
  if (error || !quiz)
    return <EmptyState title="Quiz unavailable" description={api.errorMessage(error)} />;

  const answered = Object.keys(answers).length;

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground">
        {quiz.questions.length} questions · pass mark {quiz.passingScorePercent}%
      </p>

      <div className="mt-6 space-y-5">
        {quiz.questions.map((q, i) => {
          const correctId = result?.correctByQuestionId[q.id];
          return (
            <Card key={q.id}>
              <CardContent className="p-5">
                <p className="font-medium">
                  <span className="mr-2 font-display text-accent">{i + 1}.</span>
                  {q.questionText}
                </p>
                <RadioGroup
                  className="mt-4 space-y-2"
                  value={answers[q.id] ?? ""}
                  onValueChange={(v) => !result && setAnswers((a) => ({ ...a, [q.id]: v }))}
                >
                  {q.options.map((o) => {
                    const isCorrect = result && correctId === o.id;
                    const isWrongPick = result && answers[q.id] === o.id && correctId !== o.id;
                    return (
                      <label
                        key={o.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-sm border border-border px-3 py-2.5 text-sm",
                          isCorrect && "border-accent bg-accent/10",
                          isWrongPick && "border-destructive bg-destructive/5",
                        )}
                      >
                        <RadioGroupItem value={o.id} disabled={!!result} />
                        <span className="flex-1">{o.optionText}</span>
                        {isCorrect && <CheckCircle2 className="size-4 text-accent" />}
                        {isWrongPick && <XCircle className="size-4 text-destructive" />}
                      </label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
        {result ? (
          <>
            <p className="font-display text-2xl">{result.attempt.scorePercent}%</p>
            <p className={cn("text-sm", result.attempt.passed ? "text-accent" : "text-destructive")}>
              {result.attempt.passed ? "Passed — lesson marked complete." : "Not passed yet."}
            </p>
            {!result.attempt.passed && (
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
              >
                Try again
              </Button>
            )}
          </>
        ) : (
          <Button
            disabled={submit.isPending || answered < quiz.questions.length}
            onClick={() => submit.mutate()}
          >
            {answered < quiz.questions.length
              ? `Answer all ${quiz.questions.length} questions`
              : "Submit answers"}
          </Button>
        )}
      </div>
    </div>
  );
}
