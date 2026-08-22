import { createFileRoute, redirect } from "@/lib/router";

export const Route = createFileRoute("/_authenticated/student/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/profile" });
  },
});
