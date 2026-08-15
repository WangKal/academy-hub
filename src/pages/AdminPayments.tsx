import { useState } from "react";
import { adminPayments, formatCurrency, type Payment } from "@/lib/data";
import {
  PageHeader,
  Badge,
  Btn,
  Input,
  Select,
  DataTable,
  type Column,
  MetricCard,
} from "@/components/ui";

interface Props {
  onNavigate: (page: string) => void;
}

export default function AdminPayments({ onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = adminPayments.filter((p) => {
    if (
      search &&
      !p.user.toLowerCase().includes(search.toLowerCase()) &&
      !p.course.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const totalRevenue = adminPayments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = adminPayments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = adminPayments.filter((p) => p.status === "pending").length;
  const failedCount = adminPayments.filter((p) => p.status === "failed").length;

  const columns: Column<Payment>[] = [
    { key: "id", label: "ID", mono: true },
    {
      key: "user",
      label: "Customer",
      render: (row) => <span className="font-medium text-stone-800">{row.user}</span>,
    },
    { key: "course", label: "Course" },
    {
      key: "amount",
      label: "Amount",
      mono: true,
      render: (row) => <span className="font-semibold text-stone-900">${row.amount}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const v = {
          succeeded: "success",
          pending: "warning",
          failed: "danger",
          refunded: "neutral",
        } as const;
        const labels = {
          succeeded: "✓ Succeeded",
          pending: "⌛ Pending",
          failed: "✗ Failed",
          refunded: "↩ Refunded",
        };
        return <Badge variant={v[row.status]}>{labels[row.status]}</Badge>;
      },
    },
    { key: "method", label: "Method", mono: true },
    { key: "date", label: "Date", mono: true },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {row.status === "failed" && (
            <Btn variant="ghost" size="sm">
              Retry
            </Btn>
          )}
          {row.status === "succeeded" && (
            <Btn variant="ghost" size="sm">
              Refund
            </Btn>
          )}
          <Btn variant="ghost" size="sm">
            Receipt
          </Btn>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title="Payments"
        description="Transaction history and payment management."
        breadcrumb={[
          { label: "Admin", onClick: () => onNavigate("admin-overview") },
          { label: "Payments" },
        ]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total revenue"
          value={formatCurrency(totalRevenue)}
          sub="succeeded transactions"
          icon={<DollarIcon />}
        />
        <MetricCard
          label="Refunded"
          value={formatCurrency(totalRefunded)}
          sub="this period"
          icon={<RefundIcon />}
        />
        <MetricCard
          label="Pending"
          value={pendingCount}
          sub="awaiting confirmation"
          icon={<ClockIcon />}
        />
        <MetricCard
          label="Failed"
          value={failedCount}
          sub="require attention"
          icon={<AlertIcon />}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search customer or course…"
          value={search}
          onChange={setSearch}
          icon={<SearchIcon />}
          className="flex-1 min-w-48"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "succeeded", label: "Succeeded" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
        <Btn variant="secondary" size="sm">
          Export CSV
        </Btn>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <DataTable columns={columns} rows={filtered} />
      </div>
    </div>
  );
}

function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 4.5v7M6 6.5c0-1 1-1.5 2-1.5s2 .5 2 1.5S9 8 8 8s-2 .5-2 1.5S7 11 8 11s2-.5 2-1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function RefundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8a5 5 0 1 0 1-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M1 5l2 3 2-3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2L1.5 13.5h13L8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line
        x1="8"
        y1="7"
        x2="8"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="12" r="0.75" fill="currentColor" />
    </svg>
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
