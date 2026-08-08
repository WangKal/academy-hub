import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  Bell,
  BarChart3,
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Learning",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student", "instructor", "admin"] },
      { to: "/my-courses", label: "My courses", icon: Library, roles: ["student", "instructor", "admin"] },
      { to: "/my-certificates", label: "Certificates", icon: Award, roles: ["student", "instructor", "admin"] },
      { to: "/courses", label: "Catalogue", icon: BookOpen, roles: ["student", "instructor", "admin"] },
      { to: "/notifications", label: "Notifications", icon: Bell, roles: ["student", "instructor", "admin"] },
    ],
  },
  {
    group: "Teaching",
    items: [
      { to: "/instructor/courses", label: "Course builder", icon: GraduationCap, roles: ["instructor", "admin"] },
      { to: "/instructor/submissions", label: "Assignment reviews", icon: ScrollText, roles: ["instructor", "admin"] },
      { to: "/instructor/students", label: "Students", icon: Users, roles: ["instructor", "admin"] },
    ],
  },
  {
    group: "Administration",
    items: [
      { to: "/admin", label: "Overview", icon: BarChart3, roles: ["admin"] },
      { to: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
      { to: "/admin/enrollments", label: "Enrollments", icon: ScrollText, roles: ["admin"] },
      { to: "/admin/payments", label: "Payments", icon: CreditCard, roles: ["admin"] },
      { to: "/admin/certificates", label: "Certificates", icon: Award, roles: ["admin"] },
      { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] },
    ],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function AcademySidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = user?.role ?? "student";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-3 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="truncate font-display text-base text-sidebar-foreground">EA Academy</span>
        </div>

        {NAV.map((group) => {
          const items = group.items.filter((i) => i.roles.includes(role));
          if (!items.length) return null;
          return (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        <div className="mt-auto border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                {initials(user?.fullName ?? "EA")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm text-sidebar-foreground">{user?.fullName}</p>
              <p className="truncate text-xs capitalize text-sidebar-foreground/60">{role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AcademySidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-14 items-center gap-3 border-b border-border px-4">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <NotificationBell />
            {actions}
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
