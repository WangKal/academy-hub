import { createFileRoute, redirect } from "@/lib/router";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});
