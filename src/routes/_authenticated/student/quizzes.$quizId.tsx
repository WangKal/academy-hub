import { createFileRoute, redirect } from "@/lib/router";

export const Route = createFileRoute("/_authenticated/student/quizzes/$quizId")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
