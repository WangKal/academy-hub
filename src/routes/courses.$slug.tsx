import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileText, Lock, PlayCircle, Users } from "lucide-react";
import { toast } from "sonner";

import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { EmptyState, LoadingBlock, formatDuration, formatPrice } from "@/components/layout/States";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";

export const Route = createFileRoute("/courses/$slug")({
  head: () => ({
    meta: [
      { title: "Course details — EA Academy" },
      {
        name: "description",
        content:
          "Curriculum, outcomes and enrolment details for this Executive & Personal Assistant Academy course.",
      },
      { property: "og:title", content: "Course details — EA Academy" },
      {
        property: "og:description",
        content: "Curriculum, outcomes and enrolment details for this EA Academy course.",
      },
    ],
  }),
  component: CourseDetailPage,
});

const lessonIcon = {
  video: PlayCircle,
  text: FileText,
  quiz: CheckCircle2,
  assignment: FileText,
} as const;

function CourseDetailPage() {
  const { slug } = useParams({ from: "/courses/$slug" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.getCourse(slug),
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", course?.id],
    queryFn: () => api.getEnrollment(course!.id),
    enabled: !!course && !!user,
  });

  const enrol = useMutation({
    mutationFn: () => api.enrollInCourse(course!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollment", course?.id] });
      toast.success("You're enrolled.");
      navigate({ to: "/learn/$courseId", params: { courseId: course!.id } });
    },
    onError: (e) => toast.error(api.errorMessage(e, "Enrolment failed.")),
  });

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {isLoading ? (
        <div className="mx-auto max-w-4xl px-5 py-16">
          <LoadingBlock rows={4} />
        </div>
      ) : error || !course ? (
        <div className="mx-auto max-w-4xl px-5 py-16">
          <EmptyState title="Course not found" description={api.errorMessage(error)} />
        </div>
      ) : (
        <>
          <section className="border-b border-border bg-secondary/40">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_0.6fr]">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {course.level}
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {course.category}
                  </span>
                </div>
                <h1 className="mt-4 text-balance text-4xl leading-tight">{course.title}</h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                  {course.shortDescription}
                </p>
                <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" /> {course.enrollmentCount ?? 0} enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-4" /> {course.lessonCount ?? 0} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />{" "}
                    {formatDuration(course.totalDurationSeconds ?? 0)}
                  </span>
                </div>
              </div>

              <Card className="h-fit">
                <CardContent className="space-y-4 p-6">
                  <p className="font-display text-3xl">
                    {formatPrice(course.priceCents, course.currency)}
                  </p>
                  {!user ? (
                    <Button className="w-full" onClick={() => navigate({ to: "/auth" })}>
                      Sign in to enrol
                    </Button>
                  ) : enrollment ? (
                    <Button
                      className="w-full"
                      onClick={() =>
                        navigate({ to: "/learn/$courseId", params: { courseId: course.id } })
                      }
                    >
                      Continue learning
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={enrol.isPending}
                      onClick={() => enrol.mutate()}
                    >
                      {enrol.isPending ? "Enrolling…" : "Enrol now"}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Includes graded assessments and a verifiable certificate on completion.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.4fr_0.6fr]">
            <div>
              <h2 className="text-2xl">About this course</h2>
              <div
                className="prose prose-slate mt-4 max-w-none text-muted-foreground [&_li]:mt-1 [&_p]:mt-3"
                dangerouslySetInnerHTML={{ __html: course.descriptionHtml }}
              />

              <h2 className="mt-12 text-2xl">Curriculum</h2>
              <Accordion type="multiple" className="mt-4">
                {course.modules.map((m, i) => (
                  <AccordionItem key={m.id} value={m.id}>
                    <AccordionTrigger className="text-left">
                      <span>
                        <span className="mr-3 font-display text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {m.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {m.lessons.map((l) => {
                          const Icon = lessonIcon[l.lessonType] ?? FileText;
                          return (
                            <li
                              key={l.id}
                              className="flex items-center gap-3 text-sm text-muted-foreground"
                            >
                              <Icon className="size-4 shrink-0 text-accent" />
                              <span className="flex-1">{l.title}</span>
                              {l.isPreview ? (
                                <Badge variant="outline">Preview</Badge>
                              ) : (
                                <Lock className="size-3.5" />
                              )}
                              <span className="w-14 text-right">
                                {formatDuration(l.durationSeconds)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <aside>
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Instructor
                  </p>
                  <p className="mt-2 font-display text-lg">{course.instructorName ?? "Academy faculty"}</p>
                </CardContent>
              </Card>
            </aside>
          </section>
        </>
      )}

      <PublicFooter />
    </div>
  );
}
