import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSearch, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_authenticated/admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Center & Compliance — EA Academy" },
      { name: "description", content: "Inspect system audit logs, security events and administrative actions." },
    ],
  }),
  component: AdminAuditLogsPage,
});

function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", search, entityType],
    queryFn: () => api.getAuditLogs({ search, entityType: entityType === "all" ? undefined : entityType }),
  });

  const handleExportCsv = async () => {
    try {
      const csvContent = await api.exportAuditLogsCsv({
        search,
        entityType: entityType === "all" ? undefined : entityType,
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Audit logs exported to CSV.");
    } catch (e) {
      toast.error(api.errorMessage(e));
    }
  };

  return (
    <AppShell
      title="Audit Center & Enterprise Compliance"
      description="Inspect system audit logs, security events, administrative role changes, and corporate compliance records"
      actions={
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="mr-1.5 size-4" /> Export CSV Report
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          placeholder="Search by action, user ID or metadata..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All entity types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="enrollment">Enrollments</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="certificate">Certificates</SelectItem>
            <SelectItem value="organization">Organizations</SelectItem>
            <SelectItem value="admin_permission">Admin Roles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load audit logs" description={api.errorMessage(error)} />
      ) : !data?.items.length ? (
        <EmptyState title="No audit logs recorded for this filter" />
      ) : (
        <div className="rounded-xl border border-edge bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Metadata Payload</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="font-medium text-xs">
                      {log.userName ?? log.userId ?? "System Automated"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px] bg-secondary/50">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-xs font-medium">{log.entityType}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-ink-3">
                    {log.entityId ? `${log.entityId.slice(0, 8)}...` : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-[11px] text-ink-3">
                    {JSON.stringify(log.metadata)}
                  </TableCell>
                  <TableCell className="text-xs text-ink-3">
                    {formatDate(log.createdAt)}
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
