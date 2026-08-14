import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/certificates")({
  beforeLoad: () => {
    throw redirect({ to: "/my-certificates" });
  },
});
