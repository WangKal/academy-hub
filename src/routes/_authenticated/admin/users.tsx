import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@/lib/router";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";
import type { AdminSubRole, UserRole, UserStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !can(user, "users", "view")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Users — EA Academy admin" },
      { name: "description", content: "Manage learner, instructor and admin accounts." },
      { property: "og:title", content: "Users — EA Academy admin" },
      { property: "og:description", content: "Manage academy accounts, roles and status." },
    ],
  }),
  component: AdminUsers,
});

const ADMIN_TIERS: { value: AdminSubRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "platform_admin", label: "Platform Admin" },
  { value: "academic_admin", label: "Academic Admin" },
  { value: "finance_admin", label: "Finance Admin" },
  { value: "user_admin", label: "User Admin" },
  { value: "compliance_admin", label: "Compliance Admin" },
  { value: "org_admin", label: "Organization Admin" },
];

function AdminUsers() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canAssign = !!user && can(user, "users", "assign");
  const canSuspend = !!user && can(user, "users", "suspend");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [adminCandidate, setAdminCandidate] = useState<import("@/types").User | null>(null);
  const [adminTiers, setAdminTiers] = useState<AdminSubRole[]>([]);
  const [adminOrganizationIds, setAdminOrganizationIds] = useState<string[]>([]);

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-user-organizations"],
    queryFn: () => api.getOrganizations(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", search, role],
    queryFn: () => api.getUsers({ search, role, pageSize: 50 }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const setUserRole = useMutation({
    mutationFn: (v: { id: string; role: UserRole }) => api.updateUserRole(v.id, v.role),
    onSuccess: () => { invalidate(); toast.success("Role updated."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const provisionAdmin = useMutation({
    mutationFn: () => {
      if (!adminCandidate || !adminTiers.length) throw new Error("Select an administrator tier.");
      return api.assignAdminRoles(adminCandidate.id, adminTiers, adminOrganizationIds);
    },
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Administrator provisioned with the selected tiers and scope.");
      setAdminCandidate(null);
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: UserStatus }) => api.updateUserStatus(v.id, v.status),
    onSuccess: () => {
      invalidate();
      toast.success("Status updated.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <>
    <AppShell title="Users" description="Accounts, roles and access">
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onValueChange={(v) => setRole(v as UserRole | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="instructor">Instructors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load users" description={api.errorMessage(error)} />
      ) : !data?.items.length ? (
        <EmptyState title="No users match your filters" />
      ) : (
        <div className="rounded-xl border border-edge bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="w-44">Role</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link to="/admin/users/$userId" params={{ userId: u.id }} className="font-medium hover:text-brand-600">{u.fullName}</Link>
                    <p className="text-xs text-ink-3">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      disabled={!canAssign}
                      value={u.role}
                      onValueChange={(v) => {
                        const nextRole = v as UserRole;
                        if (nextRole === "admin") {
                          setAdminTiers([]);
                          setAdminOrganizationIds([]);
                          setAdminCandidate(u);
                        } else {
                          setUserRole.mutate({ id: u.id, role: nextRole });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      disabled={!canSuspend}
                      value={u.status}
                      onValueChange={(v) => setStatus.mutate({ id: u.id, status: v as UserStatus })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatDate(u.createdAt)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>


      <Dialog open={!!adminCandidate} onOpenChange={(open) => !open && setAdminCandidate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Provision administrator</DialogTitle>
            <DialogDescription>
              {adminCandidate?.fullName} will receive the administrator role only after at least one tier is assigned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium">Administrative tiers</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {ADMIN_TIERS.map((tier) => (
                  <label key={tier.value} className="flex items-center gap-2 rounded border border-edge p-2 text-sm">
                    <input
                      type="checkbox"
                      checked={adminTiers.includes(tier.value)}
                      onChange={() => setAdminTiers((prev) => {
                        if (tier.value === "super_admin") return prev.includes(tier.value) ? [] : [tier.value];
                        const withoutSuper = prev.filter((v) => v !== "super_admin");
                        return withoutSuper.includes(tier.value) ? withoutSuper.filter((v) => v !== tier.value) : [...withoutSuper, tier.value];
                      })}
                    />
                    {tier.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Organization scope</p>
              <p className="mt-1 text-xs text-ink-4">Leave empty for platform-wide scope, or select the organizations this administrator may manage.</p>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded border border-edge p-2">
                {organizations.map((org) => (
                  <label key={org.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={adminOrganizationIds.includes(org.id)} onChange={() => setAdminOrganizationIds((prev) => prev.includes(org.id) ? prev.filter((id) => id !== org.id) : [...prev, org.id])} />
                    {org.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAdminCandidate(null)}>Cancel</Button>
            <Button disabled={!adminTiers.length || provisionAdmin.isPending} onClick={() => provisionAdmin.mutate()}>
              {provisionAdmin.isPending ? "Provisioning…" : "Create administrator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
