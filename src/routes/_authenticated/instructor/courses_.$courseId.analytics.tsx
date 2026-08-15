import { createFileRoute, redirect } from "@tanstack/react-router";

/** /instructor/courses/$courseId/analytics redirects to the course editor. */
export const Route = createFileRoute("/_authenticated/instructor/courses_/$courseId/analytics")({
  beforeLoad: ({ context, params }) => {
    const user = (context as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({
      to: "/instructor/courses/$courseId",
      params: { courseId: params.courseId },
    });
  },
});
