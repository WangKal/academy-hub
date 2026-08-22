import { Link, useNavigate, useRouterState } from "@/lib/router";
import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileSearch,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Moon,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Avatar } from "@/components/ds";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { can } from "@/services/permissions";
import type { Resource, Action, UserRole } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  permission?: { resource: Resource; action: Action };
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student", "instructor", "admin", "auditor"] },
      { to: "/my-courses", label: "My Learning", icon: Library, roles: ["student"] },
      { to: "/instructor/courses", label: "My Teaching", icon: GraduationCap, roles: ["instructor"], permission: { resource: "courses", action: "view" } },
      { to: "/admin/courses", label: "Managed Courses", icon: BookOpen, roles: ["admin"], permission: { resource: "courses", action: "view" } },
      { to: "/courses", label: "Catalogue", icon: BookOpen, roles: ["student", "instructor", "admin"] },
      { to: "/my-certificates", label: "My Certificates", icon: Award, roles: ["student", "instructor"] },
    ],
  },
  {
    group: "Teaching",
    items: [
      { to: "/instructor/submissions", label: "Assignment Reviews", icon: ScrollText, roles: ["instructor", "admin"], permission: { resource: "submissions", action: "review" } },
      { to: "/instructor/students", label: "Learners", icon: Users, roles: ["instructor", "admin"], permission: { resource: "students", action: "view" } },
    ],
  },
  {
    group: "Administration",
    items: [
      { to: "/admin", label: "Overview", icon: BarChart3, roles: ["admin"], permission: { resource: "users", action: "view" } },
      { to: "/admin/courses", label: "Courses", icon: BookOpen, roles: ["admin"], permission: { resource: "courses", action: "view" } },
      { to: "/admin/team", label: "Administrators", icon: ShieldCheck, roles: ["admin"], permission: { resource: "admins", action: "view" } },
      { to: "/admin/organizations", label: "Organizations", icon: Building2, roles: ["admin"], permission: { resource: "organizations", action: "view" } },
      { to: "/admin/users", label: "Users", icon: Users, roles: ["admin"], permission: { resource: "users", action: "view" } },
      { to: "/admin/enrollments", label: "Enrollments", icon: ScrollText, roles: ["admin"], permission: { resource: "enrollments", action: "view" } },
      { to: "/admin/payments", label: "Payments", icon: CreditCard, roles: ["admin"], permission: { resource: "payments", action: "view" } },
      { to: "/admin/certificates", label: "Certificates", icon: Award, roles: ["admin"], permission: { resource: "certificates", action: "view" } },
      { to: "/admin/audit-logs", label: "Audit Center", icon: FileSearch, roles: ["admin"], permission: { resource: "audit", action: "view" } },
      { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"], permission: { resource: "settings", action: "view" } },
    ],
  },
];

function SidebarNav({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = user?.role ?? "student";

  return (
    <aside
      className="z-20 hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            A
          </span>
          {!collapsed && (
            <span className="font-display text-sm font-semibold tracking-wide text-white">
              Academy Hub
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => onCollapse(true)}
            aria-label="Collapse sidebar"
            className="rounded p-1 text-sidebar-foreground/60 transition-colors hover:text-sidebar-accent-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map((group) => {
          const items = group.items.filter((i) => {
            if (!i.roles.includes(role)) return false;
            if (i.permission && user?.role === "admin") {
              return can(user, i.permission.resource, i.permission.action);
            }
            return true;
          });
          if (!items.length) return null;
          return (
            <div key={group.group} className="mb-2">
              {!collapsed && (
                <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">
                  {group.group}
                </div>
              )}
              {items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0", active && "text-brand-500")} />
                    {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto h-4 w-1 rounded-full bg-brand-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {collapsed ? (
        <div className="border-t border-sidebar-border px-2 py-2">
          <button
            type="button"
            onClick={() => onCollapse(false)}
            aria-label="Expand sidebar"
            className="flex w-full justify-center rounded-lg py-1.5 text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.fullName ?? "Academy"} src={user?.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-sidebar-accent-foreground">
                {user?.fullName}
              </div>
              <div className="font-mono text-[10px] capitalize text-sidebar-foreground/60">
                {role}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export function AppShell({
  title,
  description,
  breadcrumb,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/courses" });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SidebarNav collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-14 shrink-0 items-center gap-3 border-b border-edge bg-card px-4">
          <form onSubmit={submitSearch} className="max-w-sm flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses…"
                aria-label="Search courses"
                className="w-full rounded-lg border border-edge bg-surface-2 py-1.5 pl-9 pr-3 text-sm text-ink-1 placeholder:text-ink-4 transition-all focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="rounded-lg p-2 text-ink-3 transition-all hover:bg-surface-2 hover:text-ink-1"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-surface-2">
                <Avatar name={user?.fullName ?? "Academy"} src={user?.avatarUrl} size="sm" />
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-medium text-ink-1">{user?.fullName}</div>
                  <div className="font-mono text-[10px] capitalize text-ink-4">{user?.role}</div>
                </div>
                <ChevronDown className="size-3.5 text-ink-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-xs font-medium text-ink-1">{user?.fullName}</div>
                  <div className="font-mono text-xs text-ink-4">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile & Security</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-certificates">My certificates</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-rose-600">
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="page-fade flex-1 overflow-y-auto p-5 md:p-7">
          <div className="mx-auto w-full max-w-7xl">
            {title && (
              <div className="mb-7 flex flex-col gap-1">
                {breadcrumb}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="truncate font-display text-2xl font-semibold text-ink-1">
                      {title}
                    </h1>
                    {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
                  </div>
                  {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
