import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
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
import type { UserRole, UserStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
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

function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", search, role],
    queryFn: () => api.getUsers({ search, role, pageSize: 50 }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const setUserRole = useMutation({
    mutationFn: (v: { id: string; role: UserRole }) => api.updateUserRole(v.id, v.role),
    onSuccess: () => {
      invalidate();
      toast.success("Role updated.");
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
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-xs text-ink-3">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => setUserRole.mutate({ id: u.id, role: v as UserRole })}
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
                      value={u.status}
                      onValueChange={(v) =>
                        setStatus.mutate({ id: u.id, status: v as UserStatus })
                      }
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
  );
}
