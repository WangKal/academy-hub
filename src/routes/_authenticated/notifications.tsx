import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — EA Academy" },
      { name: "description", content: "Enrolment, grading and certificate alerts from EA Academy." },
      { property: "og:title", content: "Notifications — EA Academy" },
      { property: "og:description", content: "Your EA Academy activity alerts." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(100),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });

  const readAll = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: invalidate,
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const readOne = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteNotification(id),
    onSuccess: invalidate,
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell
      title="Notifications"
      description="Everything that happened on your account"
      actions={
        <Button variant="outline" size="sm" onClick={() => readAll.mutate()}>
          Mark all read
        </Button>
      }
    >
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load notifications" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState
          title="Nothing here yet"
          description="Enrolments, graded assignments, payments and certificates will appear here."
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-edge bg-card">
          {data.map((n) => (
            <div
              key={n.id}
              className={cn("flex items-start gap-3 p-4", !n.readAt && "bg-secondary/30")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <Badge variant="secondary" className="capitalize">
                    {n.type}
                  </Badge>
                  {!n.readAt && <Badge>New</Badge>}
                </div>
                {n.body && <p className="mt-1 text-sm text-ink-3">{n.body}</p>}
                <p className="mt-1 text-xs text-ink-3/70">{formatDate(n.createdAt)}</p>
              </div>
              {!n.readAt && (
                <Button size="sm" variant="ghost" onClick={() => readOne.mutate(n.id)}>
                  Mark read
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete notification"
                onClick={() => remove.mutate(n.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
