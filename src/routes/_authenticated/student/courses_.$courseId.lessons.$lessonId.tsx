import { createFileRoute, redirect } from "@tanstack/react-router";

/** /student/courses/$courseId/lessons/$lessonId redirects to the course player. */
export const Route = createFileRoute(
  "/_authenticated/student/courses_/$courseId/lessons/$lessonId",
)({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$courseId", params: { courseId: params.courseId } });
  },
});
