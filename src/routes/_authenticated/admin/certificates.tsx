import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates — EA Academy admin" },
      { name: "description", content: "Issue, revoke and reissue academy certificates." },
      { property: "og:title", content: "Certificates — EA Academy admin" },
      { property: "og:description", content: "Manage issued academy credentials." },
    ],
  }),
  component: AdminCertificates,
});

function AdminCertificates() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-certificates", search],
    queryFn: () => api.getCertificates({ search, pageSize: 50 }),
  });

  const done = () => {
    qc.invalidateQueries({ queryKey: ["admin-certificates"] });
    toast.success("Certificate updated.");
  };

  const revoke = useMutation({
    mutationFn: (id: string) => api.revokeCertificate(id),
    onSuccess: done,
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const reissue = useMutation({
    mutationFn: (id: string) => api.reissueCertificate(id),
    onSuccess: done,
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell title="Certificates" description="Issued credentials">
      <Input
        placeholder="Search code or learner…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 max-w-xs"
      />
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load certificates" description={api.errorMessage(error)} />
      ) : !data?.items.length ? (
        <EmptyState title="No certificates issued yet" />
      ) : (
        <div className="rounded-xl border border-edge bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.certificateCode}</TableCell>
                  <TableCell>{c.userName}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "issued" ? "default" : "destructive"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(c.issuedAt)}</TableCell>
                  <TableCell className="text-right">
                    {c.status === "issued" ? (
                      <Button size="sm" variant="outline" onClick={() => revoke.mutate(c.id)}>
                        Revoke
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => reissue.mutate(c.id)}>
                        Reissue
                      </Button>
                    )}
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
