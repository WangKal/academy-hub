import { createFileRoute, Link, redirect } from "@/lib/router";
import { can } from "@/services/permissions";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

/** Compatibility entry point. The canonical course workspace is the same reusable builder route. */
export const Route = createFileRoute("/_authenticated/instructor/courses_/$courseId/builder")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !(can(user, "courses", "view", { instructorId: user.id }) || (user.role === "admin" && can(user, "courses", "view")))) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: BuilderEntry,
});

function BuilderEntry() {
  const { courseId } = Route.useParams();
  return <AppShell title="Course Workspace" description="Open the canonical reusable course builder.">
    <div className="rounded-xl border border-edge bg-card p-6">
      <p className="text-sm text-ink-3">This workspace uses the same course, module, lesson, assessment, relationship and learner components used by instructors and authorized administrators.</p>
      <Button asChild className="mt-4"><Link to="/instructor/courses/$courseId" params={{ courseId }}>Open course workspace</Link></Button>
    </div>
  </AppShell>;
}
