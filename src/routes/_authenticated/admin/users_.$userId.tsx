import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, Link, useParams } from "@/lib/router";
import { ArrowLeft, Award, BookOpen, CheckCircle2, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Panel, Pill, ProgressBar } from "@/components/ds";
import { can } from "@/services/permissions";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/users_/$userId")({
  beforeLoad: ({ context }) => { const user=(context as any).user; if (!user || !can(user,"users","view")) throw redirect({ to: "/dashboard" }); },
  component: AdminUserDetail,
});

function AdminUserDetail() {
  const { userId } = useParams({ from: "/_authenticated/admin/users_/$userId" });
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-user-overview", userId], queryFn: () => api.getUserLearningOverview(userId) });
  if (isLoading) return <AppShell title="User"><LoadingBlock rows={6} /></AppShell>;
  if (error || !data) return <AppShell title="User"><EmptyState title="Could not load user" description={api.errorMessage(error)} /></AppShell>;
  return <AppShell title={data.user.fullName} description={`${data.user.email} · ${data.user.role}`} breadcrumb={<Link to="/admin/users" className="text-xs text-ink-3"><ArrowLeft className="mr-1 inline size-3" />Users</Link>}>
    <div className="grid gap-4 md:grid-cols-4"><Panel className="p-4"><p className="text-xs text-ink-4">Role</p><p className="mt-1 font-semibold capitalize">{data.user.role}</p></Panel><Panel className="p-4"><p className="text-xs text-ink-4">Courses enrolled</p><p className="mt-1 font-semibold">{data.enrollments.length}</p></Panel><Panel className="p-4"><p className="text-xs text-ink-4">Certificates</p><p className="mt-1 font-semibold">{data.certificates.length}</p></Panel><Panel className="p-4"><p className="text-xs text-ink-4">Submissions</p><p className="mt-1 font-semibold">{data.submissions.length}</p></Panel></div>
    <Panel className="mt-6 p-5"><h2 className="font-display text-lg font-semibold">Enrolled courses</h2><div className="mt-4 space-y-3">{data.enrollments.map((e) => <div key={e.id} className="rounded-lg border border-edge p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{e.course?.title ?? "Course"}</h3><p className="mt-1 text-xs text-ink-4">Enrolled {formatDate(e.enrolledAt)} · {e.status}</p></div><Pill variant={e.status === "completed" ? "success" : "info"}>{e.progressPercent ?? 0}%</Pill></div><ProgressBar value={e.progressPercent ?? 0} className="mt-3"/><div className="mt-3 grid gap-2 text-xs text-ink-4 sm:grid-cols-3"><span><BookOpen className="mr-1 inline size-3" />{e.lessonsCompleted ?? 0}/{e.lessonsTotal ?? 0} lessons</span><span><FileText className="mr-1 inline size-3" />{data.submissions.filter((s) => e.courseId === e.course?.id).length} submissions</span><span><Award className="mr-1 inline size-3" />{data.certificates.filter((c) => c.courseId === e.courseId).length} certificates</span></div></div>)}{!data.enrollments.length && <p className="text-sm text-ink-4">No course enrollments.</p>}</div></Panel>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel className="p-5"><h2 className="font-display text-lg font-semibold">Lesson activity</h2><div className="mt-3 space-y-2">{data.enrollments.flatMap((e) => (e.lessonProgress ?? []).map((p) => <div key={p.id} className="flex items-center justify-between rounded border border-edge px-3 py-2 text-sm"><span>Lesson activity</span><Pill variant={p.status === "completed" ? "success" : "neutral"}>{p.status.replace("_", " ")}</Pill></div>))}{!data.enrollments.some((e) => e.lessonProgress?.length) && <p className="text-sm text-ink-4">No lesson activity yet.</p>}</div></Panel><Panel className="p-5"><h2 className="font-display text-lg font-semibold">Submissions & certificates</h2><div className="mt-3 space-y-2">{data.submissions.map((s) => <div key={s.id} className="rounded border border-edge p-3 text-sm"><span className="font-medium">Assignment submission</span><span className="ml-2 text-xs text-ink-4">{s.status} · {formatDate(s.submittedAt)}</span>{s.grade != null && <span className="ml-2 text-xs">Grade {s.grade}</span>}</div>)}{data.certificates.map((c) => <div key={c.id} className="rounded border border-edge p-3 text-sm"><Award className="mr-2 inline size-4" />{c.certificateCode} · {c.status}</div>)}{!data.submissions.length && !data.certificates.length && <p className="text-sm text-ink-4">No submissions or certificates.</p>}</div></Panel></div>
  </AppShell>;
}
