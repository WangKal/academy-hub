import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/quizzes/$quizId")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
