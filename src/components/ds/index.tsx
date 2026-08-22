/**
 * Academy Hub design-system primitives.
 * Presentation only — no data access. All colors come from semantic tokens
 * defined in src/styles.css.
 */
import { Link } from "@/lib/router";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ─── Avatar ──────────────────────────────────────────────────────────── */

const avatarPalettes = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
];

export function initials(name?: string | null) {
  return (
    (name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

function hashName(name: string) {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function Avatar({
  name,
  size = "md",
  src,
  className,
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  src?: string | null;
  className?: string;
}) {
  const palette = avatarPalettes[hashName(name || "?") % avatarPalettes.length];
  const sizeClass = {
    xs: "size-6 text-[10px]",
    sm: "size-7 text-xs",
    md: "size-8 text-sm",
    lg: "size-10 text-base",
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(sizeClass, "shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        sizeClass,
        palette,
        "flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}

/* ─── Badge / StatusDot ───────────────────────────────────────────────── */

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const badgeClasses: Record<BadgeVariant, string> = {
  default: "bg-brand-50 text-brand-700 ring-brand-200/60 dark:bg-brand-600/15 dark:text-brand-200",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-50 text-rose-700 ring-rose-200/60 dark:bg-rose-500/15 dark:text-rose-300",
  info: "bg-sky-50 text-sky-700 ring-sky-200/60 dark:bg-sky-500/15 dark:text-sky-300",
  neutral: "bg-surface-2 text-ink-3 ring-edge",
};

export function Pill({
  variant = "default",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium ring-1",
        badgeClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ variant = "default" }: { variant?: BadgeVariant }) {
  const dot: Record<BadgeVariant, string> = {
    default: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    neutral: "bg-ink-4",
  };
  return <span className={cn("inline-block size-1.5 rounded-full", dot[variant])} />;
}

/* ─── Progress ────────────────────────────────────────────────────────── */

export function ProgressBar({
  value,
  max = 100,
  size = "sm",
  showLabel = false,
  className,
}: {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / (max || 100)) * 100));
  const h = { xs: "h-1", sm: "h-1.5", md: "h-2" }[size];
  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <div className={cn("flex-1 overflow-hidden rounded-full bg-surface-3", h)}>
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-3">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

export function RingProgress({
  value,
  size = 48,
  stroke = 4,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-surface-3"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-brand-500"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

/* ─── Surfaces ────────────────────────────────────────────────────────── */

export function Panel({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-xl border border-edge bg-card",
        rest.onClick && "cursor-pointer transition-all hover:border-ink-4/50 hover:shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  trend,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: number; label: string };
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-edge bg-card p-5 transition-colors hover:border-ink-4/50">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-ink-3">{label}</span>
        {icon && <div className="shrink-0 text-brand-600 opacity-70">{icon}</div>}
      </div>
      <div>
        <div className="font-display text-2xl font-bold leading-none text-ink-1">{value}</div>
        {sub && <div className="mt-1 font-mono text-xs text-ink-4">{sub}</div>}
      </div>
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.value >= 0 ? "text-emerald-600" : "text-rose-600",
          )}
        >
          <span>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="font-normal text-ink-4">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

/* ─── States ──────────────────────────────────────────────────────────── */

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-edge bg-card p-5">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-7 w-32" />
      <Shimmer className="h-3 w-20" />
    </div>
  );
}

export function Empty({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-4">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold text-ink-1">{title}</h3>
      {body && <p className="max-w-xs text-sm text-ink-3">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
      {message}
    </div>
  );
}

/* ─── Page header ─────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: Array<{ label: string; to?: string }>;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-1">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-4">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="transition-colors hover:text-ink-2">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink-3">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-semibold text-ink-1">{title}</h1>
          {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/* ─── Tabs ────────────────────────────────────────────────────────────── */

export function TabBar({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: Array<{ id: string; label: string; count?: number }>;
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex gap-0 overflow-x-auto border-b border-edge", className)}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "border-brand-600 text-brand-700 dark:text-brand-200"
                : "border-transparent text-ink-3 hover:border-ink-4/40 hover:text-ink-1",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-xs",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-surface-2 text-ink-3",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Data table ──────────────────────────────────────────────────────── */

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  mono?: boolean;
  width?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  emptyTitle = "No records found",
  emptyBody = "No items match your current filters.",
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (rows.length === 0) return <Empty title={emptyTitle} body={emptyBody} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-edge">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-3",
                  col.width,
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-surface-2")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3 text-ink-2", col.mono && "font-mono text-xs")}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Mini bar chart ──────────────────────────────────────────────────── */

export function MiniBarChart({
  data,
  valueKey = "count",
  labelKey = "label",
}: {
  data: Record<string, unknown>[];
  valueKey?: string;
  labelKey?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 0);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-brand-500"
              style={{ height: `${pct}%`, minHeight: 2 }}
              title={`${String(d[labelKey])}: ${val}`}
            />
            <span className="font-mono text-[10px] text-ink-4">{String(d[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Formatters ──────────────────────────────────────────────────────── */

export function formatPrice(cents: number, currency = "KES") {
  if (!cents) return "Free";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
