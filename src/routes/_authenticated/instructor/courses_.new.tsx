import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";

/** /instructor/courses/new redirects to /instructor/courses which has the creation modal. */
export const Route = createFileRoute("/_authenticated/instructor/courses_/new")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !(
      can(user, "courses", "create", { instructorId: user.id }) ||
      (user.role === "admin" && can(user, "courses", "create"))
    )) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/instructor/courses" });
  },
});
