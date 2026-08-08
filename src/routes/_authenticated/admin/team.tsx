import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Shield, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
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
import type { AdminPermissionKey, AdminPermissionRecord, AdminSubRole } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/team")({
  head: () => ({
    meta: [
      { title: "Admin Team & RBAC — EA Academy" },
      { name: "description", content: "Manage multi-admin sub-roles and granular access permissions." },
    ],
  }),
  component: AdminTeamPage,
});

const SUB_ROLE_LABELS: Record<AdminSubRole, { name: string; color: string }> = {
  super_admin: { name: "Super Admin", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  academic_admin: { name: "Academic Admin", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  finance_admin: { name: "Finance Admin", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  user_admin: { name: "User Admin", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  compliance_admin: { name: "Compliance Officer", color: "bg-rose-500/10 text-rose-600 border-rose-200" },
};

const ALL_PERMISSIONS: { key: AdminPermissionKey; label: string }[] = [
  { key: "manage_users", label: "Manage User Accounts & Status" },
  { key: "manage_courses", label: "Manage Course Catalogue & Content" },
  { key: "manage_payments", label: "Manage Financial Transactions & Refunds" },
  { key: "manage_settings", label: "Manage Academy Configuration & Branding" },
  { key: "view_audit_logs", label: "Inspect & Export Compliance Audit Logs" },
  { key: "manage_admins", label: "Assign Multi-Admin Roles & Permissions" },
  { key: "manage_organizations", label: "Manage B2B Corporate Clients & Cohorts" },
];

function AdminTeamPage() {
  const qc = useQueryClient();
  const [selectedAdmin, setSelectedAdmin] = useState<AdminPermissionRecord | null>(null);
  const [editingSubRole, setEditingSubRole] = useState<AdminSubRole>("super_admin");
  const [editingPerms, setEditingPerms] = useState<AdminPermissionKey[]>([]);

  const { data: team = [], isLoading, error } = useQuery({
    queryKey: ["admin-team"],
    queryFn: () => api.getAdminTeam(),
  });

  const updateSubRoleMutation = useMutation({
    mutationFn: (v: { userId: string; subRole: AdminSubRole; perms: AdminPermissionKey[] }) =>
      api.assignAdminSubRole(v.userId, v.subRole, v.perms),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Admin role & permissions updated successfully.");
      setSelectedAdmin(null);
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const handleOpenEdit = (admin: AdminPermissionRecord) => {
    setSelectedAdmin(admin);
    setEditingSubRole(admin.subRole);
    setEditingPerms(admin.permissions);
  };

  const togglePermission = (key: AdminPermissionKey) => {
    setEditingPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
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
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{team.length}</p>
                  <p className="text-xs text-muted-foreground">Active Administrators</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Shield className="size-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {team.filter((t) => t.subRole === "super_admin").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Super Administrators</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <UserCheck className="size-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {team.filter((t) => t.subRole !== "super_admin").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Delegated Sub-Admins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card">
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
                      <p className="text-xs text-muted-foreground">{admin.userEmail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={SUB_ROLE_LABELS[admin.subRole]?.color}>
                        {SUB_ROLE_LABELS[admin.subRole]?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {admin.subRole === "super_admin" ? (
                          <Badge variant="secondary" className="text-xs">
                            Full System Access (All Permissions)
                          </Badge>
                        ) : (
                          admin.permissions.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px]">
                              {p.replace("manage_", "").replace("_", " ")}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(admin.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(admin)}>
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

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Admin Sub-Role
              </label>
              <Select
                value={editingSubRole}
                onValueChange={(v) => setEditingSubRole(v as AdminSubRole)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin (Unrestricted Access)</SelectItem>
                  <SelectItem value="academic_admin">Academic Admin (Courses & Reviews)</SelectItem>
                  <SelectItem value="finance_admin">Finance Admin (Payments & Billing)</SelectItem>
                  <SelectItem value="user_admin">User Admin (Accounts & Enrollments)</SelectItem>
                  <SelectItem value="compliance_admin">Compliance Officer (Audit & Governance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingSubRole !== "super_admin" && (
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  Granular Permissions
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 text-xs border border-border p-2 rounded cursor-pointer hover:bg-accent/50"
                    >
                      <input
                        type="checkbox"
                        checked={editingPerms.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="rounded"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedAdmin(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAdmin) {
                  updateSubRoleMutation.mutate({
                    userId: selectedAdmin.userId,
                    subRole: editingSubRole,
                    perms: editingSubRole === "super_admin" ? ALL_PERMISSIONS.map((p) => p.key) : editingPerms,
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
