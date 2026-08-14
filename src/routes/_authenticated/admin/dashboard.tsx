import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || user.role !== "admin") throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/admin" });
  },
});
