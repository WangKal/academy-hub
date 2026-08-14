import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/profile" });
  },
});
