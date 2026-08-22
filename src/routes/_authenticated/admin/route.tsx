import { createFileRoute, redirect } from "@/lib/router";
import { adminRoutePermission, can } from "@/services/permissions";
import type { CurrentUser } from "@/types";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context, location }) => {
    const user = (context as { user?: CurrentUser | null }).user;

    if (!user || user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }

    const required = adminRoutePermission(location.pathname);

    if (required && !can(user, required.resource, required.action)) {
      throw redirect({ to: "/admin" });
    }
  },
});
