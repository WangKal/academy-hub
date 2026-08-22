/**
 * Shared state components. Thin wrappers over the Academy Hub design system
 * so every page picks up the new visual language without changing its logic.
 */
import type { ReactNode } from "react";

import { Empty, ErrorNote, Shimmer } from "@/components/ds";

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-edge bg-card/50">
      <Empty title={title} body={description} action={action} icon={icon} />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <ErrorNote message={message} />;
}

export { formatPrice, formatDuration, formatDate } from "@/components/ds";
