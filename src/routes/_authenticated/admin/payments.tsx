import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate, formatPrice } from "@/components/layout/States";
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
import type { PaymentStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — EA Academy admin" },
      { name: "description", content: "Reconcile course payments and confirm enrolments." },
      { property: "og:title", content: "Payments — EA Academy admin" },
      { property: "og:description", content: "Reconcile academy course payments." },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-payments", search],
    queryFn: () => api.getPayments({ search, pageSize: 50 }),
  });

  const update = useMutation({
    mutationFn: (v: { id: string; status: PaymentStatus }) =>
      api.updatePaymentStatus(v.id, v.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Payment updated.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell title="Payments" description="Reconciliation and enrolment confirmation">
      <Input
        placeholder="Search reference, learner or course…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 max-w-sm"
      />
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load payments" description={api.errorMessage(error)} />
      ) : !data?.items.length ? (
        <EmptyState title="No payments recorded" />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.userName}</p>
                    <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                  </TableCell>
                  <TableCell>{p.courseTitle}</TableCell>
                  <TableCell>{formatPrice(p.amountCents, p.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="uppercase">
                      {p.provider}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={p.status}
                      onValueChange={(v) =>
                        update.mutate({ id: p.id, status: v as PaymentStatus })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="succeeded">Succeeded</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{formatDate(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
