import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !can(user, "users", "view")) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/admin" });
  },
});
