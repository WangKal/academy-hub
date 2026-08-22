import { createFileRoute, redirect } from "@/lib/router";

export const Route = createFileRoute("/_authenticated/student/courses")({
  beforeLoad: () => {
    throw redirect({ to: "/my-courses" });
  },
});
