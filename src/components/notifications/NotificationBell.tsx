import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationBell() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(15),
    refetchInterval: 60_000,
  });

  const items = data ?? [];
  const unread = items.filter((n) => !n.readAt).length;

  const readAll = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readOne = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative text-ink-3 hover:text-ink-1">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-card" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <p className="text-sm font-semibold text-ink-1">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs text-ink-3 hover:text-ink-1"
              onClick={() => readAll.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!items.length ? (
            <p className="px-3 py-8 text-center text-sm text-ink-3">
              You are all caught up.
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.readAt && readOne.mutate(n.id)}
                className={cn(
                  "block w-full border-b border-edge/70 px-3 py-2.5 text-left last:border-0 hover:bg-surface-2",
                  !n.readAt && "bg-brand-50/60 dark:bg-brand-600/10",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
                    {n.type}
                  </Badge>
                </div>
                {n.body && (
                  <p className="mt-1 line-clamp-2 text-xs text-ink-3">{n.body}</p>
                )}
                <p className="mt-1 text-[11px] text-ink-3/70">
                  {timeAgo(n.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-edge px-4 py-2.5">
          <Link to="/notifications" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
