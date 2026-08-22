import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, Link, useParams, useSearch } from "@/lib/router";
import { ArrowLeft, Award, BookOpen, CheckCircle2, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Panel, Pill, ProgressBar } from "@/components/ds";
import { can } from "@/services/permissions";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/instructor/students_/$userId")({
  validateSearch: (search: Record<string, unknown>) => ({ courseId: String(search.courseId ?? "") }),
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !(can(user, "students", "view", { instructorId: user.id }) || (user.role === "admin" && can(user, "students", "view")))) throw redirect({ to: "/dashboard" });
  },
  component: InstructorStudentDetail,
});

function InstructorStudentDetail() {
  const { userId } = useParams({ from: "/_authenticated/instructor/students_/$userId" });
  const { courseId } = useSearch({ from: "/_authenticated/instructor/students_/$userId" });
  const { data, isLoading, error } = useQuery({ queryKey: ["instructor-student", courseId, userId], queryFn: () => api.getInstructorStudentOverview(courseId, userId), enabled: !!courseId && !!userId });
  if (isLoading) return <AppShell title="Learner"><LoadingBlock rows={5} /></AppShell>;
  if (error || !data) return <AppShell title="Learner"><EmptyState title="Could not load learner" description={api.errorMessage(error)} /></AppShell>;
  return <AppShell title={data.user.fullName} description={`${data.user.email} · ${data.enrollment.course?.title ?? "Course learner"}`} breadcrumb={<Link to="/instructor/courses/$courseId/students" params={{ courseId }} className="text-xs text-ink-3"><ArrowLeft className="mr-1 inline size-3" />Course learners</Link>}>
    <div className="grid gap-4 md:grid-cols-4"><Panel className="p-4"><p className="text-xs text-ink-4">Enrollment</p><p className="mt-1 font-semibold capitalize">{data.enrollment.status}</p></Panel><Panel className="p-4"><p className="text-xs text-ink-4">Progress</p><p className="mt-1 font-semibold">{data.progressPercent}%</p></Panel><Panel className="p-4"><p className="text-xs text-ink-4">Lessons</p><p className="mt-1 font-semibold">{data.lessonsCompleted}/{data.lessonsTotal}</p></Panel><Panel className="p-4"><p className="text-xs text-ink-4">Certificates</p><p className="mt-1 font-semibold">{data.certificates.length}</p></Panel></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel className="p-5"><h2 className="font-display text-lg font-semibold">Learning progress</h2><ProgressBar value={data.progressPercent} showLabel className="mt-4"/><div className="mt-4 space-y-2">{data.progress.map((p) => <div key={p.id} className="flex items-center justify-between rounded border border-edge px-3 py-2 text-sm"><span className="flex items-center gap-2"><CheckCircle2 className="size-4" />Lesson</span><Pill variant={p.status === "completed" ? "success" : "neutral"}>{p.status.replace("_", " ")}</Pill></div>)}</div></Panel><Panel className="p-5"><h2 className="font-display text-lg font-semibold">Work & outcomes</h2><div className="mt-4 space-y-3">{data.submissions.map((s) => <div key={s.id} className="rounded border border-edge p-3"><div className="flex items-center gap-2"><FileText className="size-4" /><span className="font-medium">Assignment submission</span><Pill variant="neutral">{s.status}</Pill></div><p className="mt-1 text-xs text-ink-4">Submitted {formatDate(s.submittedAt)}{s.grade != null ? ` · Grade ${s.grade}` : ""}</p></div>)}{data.certificates.map((c) => <div key={c.id} className="rounded border border-edge p-3"><div className="flex items-center gap-2"><Award className="size-4" /><span className="font-medium">Certificate</span><Pill variant={c.status === "issued" ? "success" : "neutral"}>{c.status}</Pill></div><p className="mt-1 text-xs text-ink-4">{c.certificateCode}</p></div>)}{!data.submissions.length && !data.certificates.length && <p className="text-sm text-ink-4">No submissions or certificates yet.</p>}</div></Panel></div>
  </AppShell>;
}
