import { createFileRoute, redirect } from "@/lib/router";

export const Route = createFileRoute("/_authenticated/student/certificates")({
  beforeLoad: () => {
    throw redirect({ to: "/my-certificates" });
  },
});
