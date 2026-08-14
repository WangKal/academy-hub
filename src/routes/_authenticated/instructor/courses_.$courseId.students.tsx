import { createFileRoute, redirect } from "@tanstack/react-router";

/** /instructor/courses/$courseId/students redirects to the students overview. */
export const Route = createFileRoute(
  "/_authenticated/instructor/courses_/$courseId/students",
)({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/instructor/students" });
  },
});
