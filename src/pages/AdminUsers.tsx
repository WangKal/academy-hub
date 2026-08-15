import { useState } from "react";
import { adminUsers, relativeTime, type User } from "@/lib/data";
import {
  PageHeader,
  Badge,
  Avatar,
  Btn,
  Input,
  Select,
  DataTable,
  type Column,
  ConfirmDialog,
} from "@/components/ui";

interface Props {
  onNavigate: (page: string) => void;
}

export default function AdminUsers({ onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "delete";
    user: User;
  } | null>(null);

  const filtered = adminUsers.filter((u) => {
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" />
          <div>
            <div className="text-sm font-medium text-stone-800">{row.name}</div>
            <div className="text-xs text-stone-400 font-mono">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Badge
          variant={
            row.role === "admin" ? "info" : row.role === "instructor" ? "default" : "neutral"
          }
        >
          {row.role}
        </Badge>
      ),
    },
    {
      key: "organization",
      label: "Organization",
      render: (row) => <span className="text-stone-600">{row.organization}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const v = { active: "success", suspended: "danger", pending: "warning" } as const;
        return <Badge variant={v[row.status]}>{row.status}</Badge>;
      },
    },
    {
      key: "joinedAt",
      label: "Joined",
      mono: true,
      render: (row) =>
        new Date(row.joinedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      key: "enrollments",
      label: "Enrolled",
      mono: true,
      render: (row) => <span className="text-stone-600">{row.enrollments ?? 0}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row);
            }}
            className="text-xs text-stone-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({ type: "suspend", user: row });
            }}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              row.status === "suspended"
                ? "text-stone-500 hover:text-emerald-600 hover:bg-emerald-50"
                : "text-stone-500 hover:text-amber-600 hover:bg-amber-50"
            }`}
          >
            {row.status === "suspended" ? "Unsuspend" : "Suspend"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title="Users"
        description={`${adminUsers.length.toLocaleString()} registered accounts across all organizations.`}
        actions={<Btn size="sm">+ Invite user</Btn>}
      />

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { label: "Total", count: adminUsers.length, color: "text-stone-700" },
          {
            label: "Active",
            count: adminUsers.filter((u) => u.status === "active").length,
            color: "text-emerald-600",
          },
          {
            label: "Suspended",
            count: adminUsers.filter((u) => u.status === "suspended").length,
            color: "text-rose-600",
          },
          {
            label: "Pending",
            count: adminUsers.filter((u) => u.status === "pending").length,
            color: "text-amber-600",
          },
          {
            label: "Instructors",
            count: adminUsers.filter((u) => u.role === "instructor").length,
            color: "text-indigo-600",
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400">{s.label}:</span>
            <span className={`font-semibold font-mono ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={setSearch}
          icon={<SearchIcon />}
          className="flex-1 min-w-48"
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "All roles" },
            { value: "student", label: "Students" },
            { value: "instructor", label: "Instructors" },
            { value: "admin", label: "Admins" },
          ]}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "pending", label: "Pending" },
          ]}
        />
        {(search || roleFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
            className="text-xs text-stone-400 hover:text-stone-600"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-stone-400 font-mono">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <DataTable columns={columns} rows={filtered} onRowClick={setSelectedUser} />
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-xs text-stone-400 font-mono">
          Showing {filtered.length} of {adminUsers.length} users
        </span>
        <div className="flex gap-1">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`w-7 h-7 rounded-lg text-xs font-mono transition-all ${p === 1 ? "bg-indigo-600 text-white" : "text-stone-500 hover:bg-stone-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* User detail panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={(type) => setConfirmAction({ type, user: selectedUser })}
        />
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "suspend"
            ? `${confirmAction.user.status === "suspended" ? "Unsuspend" : "Suspend"} user`
            : "Delete user"
        }
        body={
          confirmAction?.type === "suspend"
            ? `Are you sure you want to ${confirmAction.user.status === "suspended" ? "unsuspend" : "suspend"} ${confirmAction?.user.name}? ${confirmAction.user.status !== "suspended" ? "They will lose access to all courses." : "They will regain access."}`
            : `This will permanently delete ${confirmAction?.user.name} and all their data. This action cannot be undone.`
        }
        confirmLabel={
          confirmAction?.type === "suspend"
            ? confirmAction.user.status === "suspended"
              ? "Unsuspend"
              : "Suspend"
            : "Delete"
        }
        variant={confirmAction?.type === "delete" ? "danger" : "primary"}
        onConfirm={() => setConfirmAction(null)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

// ─── User detail panel ────────────────────────────────────────────────────────

function UserDetailPanel({
  user,
  onClose,
  onAction,
}: {
  user: User;
  onClose: () => void;
  onAction: (type: "suspend" | "delete") => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-display text-base font-semibold text-stone-900">User details</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="lg" />
            <div>
              <div className="font-semibold text-stone-900">{user.name}</div>
              <div className="text-xs text-stone-400 font-mono">{user.email}</div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-3 text-sm">
            {[
              { label: "Role", value: user.role },
              {
                label: "Status",
                value: (
                  <Badge
                    variant={
                      user.status === "active"
                        ? "success"
                        : user.status === "suspended"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {user.status}
                  </Badge>
                ),
              },
              { label: "Organization", value: user.organization },
              {
                label: "Member since",
                value: new Date(user.joinedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              { label: "Enrollments", value: user.enrollments ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-stone-500 text-xs">{item.label}</span>
                <span className="text-stone-800 text-xs font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Btn variant="secondary" size="sm" className="w-full justify-center">
              Edit profile
            </Btn>
            <Btn
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              onClick={() => onAction("suspend")}
            >
              {user.status === "suspended" ? "Unsuspend account" : "Suspend account"}
            </Btn>
            <Btn
              variant="danger"
              size="sm"
              className="w-full justify-center"
              onClick={() => onAction("delete")}
            >
              Delete account
            </Btn>
          </div>
        </div>
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
