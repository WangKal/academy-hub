import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !can(user, "certificates", "view")) {
      throw redirect({ to: "/dashboard" });
    }
  },
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
  const { user } = useAuth();
  const canManage = !!user && (can(user, "certificates", "revoke") || can(user, "certificates", "award"));
  const canExport = !!user && can(user, "certificates", "reissue");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueUserId, setIssueUserId] = useState("");
  const [issueCourseId, setIssueCourseId] = useState("");
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-certificates", search],
    queryFn: () => api.getCertificates({ search, pageSize: 50 }),
  });
  const { data: certificateStudents } = useQuery({ queryKey: ["certificate-students"], queryFn: () => api.getUsers({ role: "student", pageSize: 500 }) });
  const { data: certificateCourses } = useQuery({ queryKey: ["certificate-courses"], queryFn: () => api.getCourses({ pageSize: 500 }) });
  const issue = useMutation({
    mutationFn: () => api.issueCertificate(issueUserId, issueCourseId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-certificates"] }); setIssueOpen(false); setIssueUserId(""); setIssueCourseId(""); toast.success("Certificate issued."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const { data: selectedCertificate, isLoading: selectedCertificateLoading } = useQuery({
    queryKey: ["certificate-detail", selectedCertificateId],
    queryFn: () => api.getCertificate(selectedCertificateId!),
    enabled: !!selectedCertificateId,
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
    <AppShell title="Certificates" description="Issued credentials" actions={<Button onClick={() => setIssueOpen(true)} disabled={!canManage}>Issue certificate</Button>}>
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
                    <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedCertificateId(c.id)}>View</Button>
                    {c.status === "issued" ? (
                      <Button size="sm" variant="outline" disabled={!canManage}
                            onClick={() => revoke.mutate(c.id)}>
                        Revoke
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled={!canExport}
                            onClick={() => reissue.mutate(c.id)}>
                        Reissue
                      </Button>
                    )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={!!selectedCertificateId} onOpenChange={(open) => !open && setSelectedCertificateId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Certificate details</DialogTitle><DialogDescription>Full credential record and verification details.</DialogDescription></DialogHeader>
          {selectedCertificateLoading ? <LoadingBlock rows={2} /> : selectedCertificate ? <div className="space-y-2 text-sm"><div><span className="text-ink-4">Learner:</span> {selectedCertificate.userName}</div><div><span className="text-ink-4">Course:</span> {selectedCertificate.courseTitle}</div><div><span className="text-ink-4">Code:</span> <span className="font-mono">{selectedCertificate.certificateCode}</span></div><div><span className="text-ink-4">Status:</span> {selectedCertificate.status}</div><div><span className="text-ink-4">Issued:</span> {formatDate(selectedCertificate.issuedAt)}</div></div> : null}
          <DialogFooter><Button variant="outline" onClick={() => setSelectedCertificateId(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue certificate</DialogTitle><DialogDescription>Issue a credential to a learner who is eligible under the academic workflow.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Learner</label><Select value={issueUserId} onValueChange={setIssueUserId}><SelectTrigger className="mt-1"><SelectValue placeholder="Select learner" /></SelectTrigger><SelectContent>{(certificateStudents?.items ?? []).map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName} — {u.email}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium">Course</label><Select value={issueCourseId} onValueChange={setIssueCourseId}><SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{(certificateCourses?.items ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setIssueOpen(false)}>Cancel</Button><Button disabled={!issueUserId || !issueCourseId || issue.isPending} onClick={() => issue.mutate()}>{issue.isPending ? "Issuing…" : "Issue certificate"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
