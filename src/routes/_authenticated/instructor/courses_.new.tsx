import { createFileRoute, redirect } from "@tanstack/react-router";

/** /instructor/courses/new redirects to /instructor/courses which has the creation modal. */
export const Route = createFileRoute("/_authenticated/instructor/courses_/new")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/instructor/courses" });
  },
});
