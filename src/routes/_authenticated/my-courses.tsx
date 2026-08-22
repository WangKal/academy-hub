import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@/lib/router";
import { Library, GraduationCap, ShieldCheck } from "lucide-react";

import { Panel, Pill, ProgressBar } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/my-courses")({
  head: () => ({
    meta: [
      { title: "My Workspace — EA Academy" },
      { name: "description", content: "Role-aware learning, teaching and managed course workspace." },
      { property: "og:title", content: "My Workspace — EA Academy" },
      { property: "og:description", content: "Role-aware learning, teaching and managed course workspace." },
    ],
  }),
  component: MyCourses,
});

function MyCourses() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const isInstructor = user?.role === "instructor";
  const isAdmin = user?.role === "admin";

  const { data: enrollments = [], isLoading: loadingEnrollments, error: enrollmentError } = useQuery({
    queryKey: ["my-enrollments"], queryFn: api.getMyEnrollments, enabled: isStudent,
  });
  const { data: teaching = [], isLoading: loadingTeaching, error: teachingError } = useQuery({
    queryKey: ["my-teaching"], queryFn: api.getInstructorCourses, enabled: isInstructor,
  });
  const { data: managed, isLoading: loadingManaged, error: managedError } = useQuery({
    queryKey: ["managed-courses"], queryFn: () => api.getCourses({ pageSize: 100 }), enabled: isAdmin,
  });
  const { data: payments = [] } = useQuery({ queryKey: ["my-payments"], queryFn: api.getMyPayments, enabled: isStudent });

  if (!user) return <LoadingBlock />;
  if (isInstructor) {
    return <AppShell title="My Teaching" description="Courses you teach and manage">
      {loadingTeaching ? <LoadingBlock /> : teachingError ? <EmptyState title="Could not load teaching workspace" description={api.errorMessage(teachingError)} /> : !teaching.length ? <EmptyState title="No teaching assignments" description="Create a course or wait to be assigned as an instructor." icon={<GraduationCap className="size-6" />} action={<Button asChild><Link to="/instructor/courses">Open teaching workspace</Link></Button>} /> : <div className="grid gap-4 md:grid-cols-2">{teaching.map((c) => <Panel key={c.id} className="p-5"><div className="flex items-start justify-between gap-3"><Pill variant={c.status === "published" ? "success" : "neutral"}>{c.status}</Pill><span className="text-xs text-ink-4">{c.enrollmentCount ?? 0} learners</span></div><h2 className="mt-3 font-display text-lg font-semibold">{c.title}</h2><p className="mt-1 text-xs text-ink-4">{c.lessonCount ?? 0} lessons · {c.instructorNames?.length ?? 1} instructors</p><div className="mt-4 flex gap-2"><Button asChild size="sm"><Link to="/instructor/courses/$courseId" params={{ courseId: c.id }}>Open course</Link></Button><Button asChild size="sm" variant="outline"><Link to="/instructor/courses/$courseId/students" params={{ courseId: c.id }}>Learners</Link></Button></div></Panel>)}</div>}
    </AppShell>;
  }
  if (isAdmin) {
    return <AppShell title="Managed Courses" description="Courses available to you through administrative permissions and organization scope">
      {loadingManaged ? <LoadingBlock /> : managedError ? <EmptyState title="Could not load managed courses" description={api.errorMessage(managedError)} /> : !managed?.items.length ? <EmptyState title="No managed courses" description="No courses fall within your current administrative scope." icon={<ShieldCheck className="size-6" />} action={<Button asChild><Link to="/admin/courses">Open course administration</Link></Button>} /> : <div className="grid gap-4 md:grid-cols-2">{managed.items.map((c) => <Panel key={c.id} className="p-5"><div className="flex items-start justify-between gap-3"><Pill variant={c.status === "published" ? "success" : "neutral"}>{c.status}</Pill><span className="text-xs text-ink-4">{c.instructorNames?.length ?? 0} instructors</span></div><h2 className="mt-3 font-display text-lg font-semibold">{c.title}</h2><p className="mt-1 text-xs text-ink-4">{c.lessonCount ?? 0} lessons · {c.enrollmentCount ?? 0} learners</p><div className="mt-4 flex gap-2"><Button asChild size="sm"><Link to="/admin/courses">Manage course</Link></Button><Button asChild size="sm" variant="outline"><Link to="/instructor/courses/$courseId" params={{ courseId: c.id }}>Open workspace</Link></Button></div></Panel>)}</div>}
    </AppShell>;
  }

  const active = enrollments.filter((e) => e.status === "active");
  return <AppShell title="My Learning" description="Everything you're enrolled in and your learning progress">
    {loadingEnrollments ? <LoadingBlock /> : enrollmentError ? <EmptyState title="Could not load your learning" description={api.errorMessage(enrollmentError)} /> : !enrollments.length ? <EmptyState title="No enrolments yet" description="Pick a programme from the catalogue to get started." icon={<Library className="size-6" />} action={<Button asChild><Link to="/courses">Browse catalogue</Link></Button>} /> : <div className="grid gap-4 md:grid-cols-2">{enrollments.map((e) => <Panel key={e.id} className="overflow-hidden"><div className="flex gap-4 p-4">{e.course?.thumbnailUrl && <img src={e.course.thumbnailUrl} alt={e.course.title ?? "Course"} className="hidden size-20 shrink-0 rounded-lg object-cover sm:block" />}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><Pill variant="neutral">{e.course?.category ?? "Course"}</Pill><Pill variant={e.status === "completed" ? "success" : "info"}>{e.status}</Pill></div><h2 className="mt-2 truncate font-display text-base font-semibold">{e.course?.title}</h2><ProgressBar value={e.progressPercent ?? 0} className="mt-3" showLabel /><div className="mt-3 flex items-center justify-between gap-2"><span className="font-mono text-xs text-ink-4">Enrolled {formatDate(e.enrolledAt)}</span><Button asChild size="sm" variant="outline"><Link to="/learn/$courseId" params={{ courseId: e.courseId }}>{e.progressPercent ? "Continue" : "Start"}</Link></Button></div></div></div></Panel>)}</div>}
    {!!active.length && !!payments.length && <Panel className="mt-8 p-5"><h2 className="font-display text-base font-semibold">Recent payments</h2>{payments.slice(0,5).map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 border-b border-edge py-3 text-sm"><div><p className="font-medium">{payment.courseTitle ?? payment.courseId}</p><p className="text-xs text-ink-4">{formatDate(payment.createdAt)} · {payment.provider}</p></div><Pill variant={payment.status === "succeeded" ? "success" : "neutral"}>{payment.status}</Pill></div>)}</Panel>}
  </AppShell>;
}

