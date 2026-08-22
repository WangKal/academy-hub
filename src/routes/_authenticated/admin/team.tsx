import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";
import { Shield, ShieldCheck, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";
import type { AdminPermissionRecord, AdminSubRole } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/team")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !can(user, "admins", "view")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Team & RBAC — EA Academy" },
      {
        name: "description",
        content: "Manage multi-admin sub-roles and granular access permissions.",
      },
    ],
  }),
  component: AdminTeamPage,
});

const SUB_ROLE_LABELS: Record<AdminSubRole, { name: string; color: string }> = {
  super_admin: { name: "Super Admin", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  academic_admin: { name: "Academic Admin", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  finance_admin: {
    name: "Finance Admin",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  user_admin: { name: "User Admin", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  compliance_admin: {
    name: "Compliance Officer",
    color: "bg-rose-500/10 text-rose-600 border-rose-200",
  },
  platform_admin: {
    name: "Platform Admin",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  },
  org_admin: {
    name: "Organization Admin",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  },
};

function AdminTeamPage() {
  const { user } = useAuth();
  const canManage = !!user && can(user, "admins", "manage");
  const qc = useQueryClient();
  const [selectedAdmin, setSelectedAdmin] = useState<AdminPermissionRecord | null>(null);
  const [editingSubRoles, setEditingSubRoles] = useState<AdminSubRole[]>([]);
  const [editingOrganizationIds, setEditingOrganizationIds] = useState<string[]>([]);

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-team-organizations"],
    queryFn: () => api.getOrganizations(),
  });

  const {
    data: team = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-team"],
    queryFn: () => api.getAdminTeam(),
  });

  const updateSubRoleMutation = useMutation({
    mutationFn: (v: { userId: string; subRoles: AdminSubRole[]; organizationIds: string[] }) =>
      v.subRoles.length === 1 && v.organizationIds.length === 0
        ? api.assignAdminSubRole(v.userId, v.subRoles[0]!, [])
        : api.assignAdminRoles(v.userId, v.subRoles, v.organizationIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Admin role & permissions updated successfully.");
      setSelectedAdmin(null);
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const handleOpenEdit = (admin: AdminPermissionRecord) => {
    setSelectedAdmin(admin);
    setEditingSubRoles(admin.subRoles ?? (admin.subRole ? [admin.subRole] : []));
    setEditingOrganizationIds(admin.organizationIds ?? []);
  };

  const toggleSubRole = (role: AdminSubRole) => {
    setEditingSubRoles((prev) => {
      if (role === "super_admin") return prev.includes(role) ? [] : [role];
      const withoutSuper = prev.filter((r) => r !== "super_admin");
      return withoutSuper.includes(role)
        ? withoutSuper.filter((r) => r !== role)
        : [...withoutSuper, role];
    });
  };

  return (
    <AppShell
      title="Admin Team & Multi-Admin RBAC"
      description="Manage multi-admin team members, assign sub-roles and delegate granular access permissions"
    >
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load admin team" description={api.errorMessage(error)} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-edge bg-card p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{team.length}</p>
                  <p className="text-xs text-ink-3">Active Administrators</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-edge bg-card p-5">
              <div className="flex items-center gap-3">
                <Shield className="size-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {team.filter((t) => (t.subRoles ?? (t.subRole ? [t.subRole] : [])).includes("super_admin")).length}
                  </p>
                  <p className="text-xs text-ink-3">Super Administrators</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-edge bg-card p-5">
              <div className="flex items-center gap-3">
                <UserCheck className="size-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {team.filter((t) => !(t.subRoles ?? (t.subRole ? [t.subRole] : [])).includes("super_admin")).length}
                  </p>
                  <p className="text-xs text-ink-3">Delegated Sub-Admins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-edge bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Assigned Sub-Role</TableHead>
                  <TableHead>Delegated Permissions</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((admin) => (
                  <TableRow key={admin.userId}>
                    <TableCell>
                      <p className="font-medium">{admin.userName ?? "Admin User"}</p>
                      <p className="text-xs text-ink-3">{admin.userEmail}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(admin.subRoles ?? (admin.subRole ? [admin.subRole] : [])).length ? (admin.subRoles ?? [admin.subRole]).filter(Boolean).map((role) => (
                          <Badge key={role} variant="outline" className={SUB_ROLE_LABELS[role!]?.color}>
                            {SUB_ROLE_LABELS[role!]?.name}
                          </Badge>
                        )) : <Badge variant="destructive">Unprovisioned</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {admin.permissions.length ? admin.permissions.slice(0, 18).map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px]">
                            {p}
                          </Badge>
                        )) : <Badge variant="destructive" className="text-xs">No effective permissions</Badge>}
                        {admin.permissions.length > 18 && <Badge variant="secondary" className="text-[10px]">+{admin.permissions.length - 18} more</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-ink-3">
                      {formatDate(admin.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled={!canManage}
                        onClick={() => handleOpenEdit(admin)}>
                        Edit Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit Role & Permissions Dialog */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Admin Role & Permissions</DialogTitle>
            <DialogDescription>
              Modify role delegation for {selectedAdmin?.userName} ({selectedAdmin?.userEmail}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs font-semibold uppercase text-ink-3">Administrative tiers</label>
              <p className="mt-1 text-xs text-ink-4">Assign one or more tiers. Super Admin is exclusive.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(Object.keys(SUB_ROLE_LABELS) as AdminSubRole[]).map((role) => (
                  <label key={role} className="flex items-center gap-2 rounded border border-edge p-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editingSubRoles.includes(role)} onChange={() => toggleSubRole(role)} />
                    <span>{SUB_ROLE_LABELS[role].name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-ink-3">Organization scope</label>
              <p className="mt-1 text-xs text-ink-4">No selected organizations means platform-wide scope. Select organizations to restrict this administrator.</p>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded border border-edge p-2">
                {organizations.map((org) => (
                  <label key={org.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingOrganizationIds.includes(org.id)}
                      onChange={() => setEditingOrganizationIds((prev) => prev.includes(org.id) ? prev.filter((id) => id !== org.id) : [...prev, org.id])}
                    />
                    <span>{org.name}</span>
                    <span className="text-xs text-ink-4">{org.code}</span>
                  </label>
                ))}
                {!organizations.length && <p className="text-xs text-ink-4">No organizations available.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedAdmin(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAdmin) {
                  if (!editingSubRoles.length) {
                    toast.error("Select at least one administrative tier.");
                    return;
                  }
                  updateSubRoleMutation.mutate({
                    userId: selectedAdmin.userId,
                    subRoles: editingSubRoles,
                    organizationIds: editingOrganizationIds,
                  });
                }
              }}
              disabled={updateSubRoleMutation.isPending}
            >
              {updateSubRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
