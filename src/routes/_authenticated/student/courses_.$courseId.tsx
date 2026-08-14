import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/courses_/$courseId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$courseId", params: { courseId: params.courseId } });
  },
});
