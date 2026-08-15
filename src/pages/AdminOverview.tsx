import {
  adminStats,
  adminPayments,
  auditLogs,
  courses,
  relativeTime,
  formatCurrency,
} from "@/lib/data";
import {
  PageHeader,
  MetricCard,
  Badge,
  Btn,
  BarChart,
  DataTable,
  type Column,
} from "@/components/ui";
import { type AuditLog, type Payment } from "@/lib/data";

interface Props {
  onNavigate: (page: string) => void;
}

export default function AdminOverview({ onNavigate }: Props) {
  const paymentCols: Column<Payment>[] = [
    { key: "user", label: "User" },
    { key: "course", label: "Course" },
    {
      key: "amount",
      label: "Amount",
      mono: true,
      render: (row) => `$${row.amount}`,
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
        return <Badge variant={v[row.status] ?? "neutral"}>{row.status}</Badge>;
      },
    },
    { key: "date", label: "Date", mono: true },
  ];

  const auditCols: Column<AuditLog>[] = [
    {
      key: "actor",
      label: "Actor",
      render: (row) => <span className="text-stone-700 font-medium">{row.actor}</span>,
    },
    { key: "action", label: "Action", mono: true },
    { key: "target", label: "Target" },
    {
      key: "severity",
      label: "Severity",
      render: (row) => {
        const v = { high: "danger", medium: "warning", low: "neutral" } as const;
        return <Badge variant={v[row.severity]}>{row.severity}</Badge>;
      },
    },
    {
      key: "timestamp",
      label: "Time",
      mono: true,
      render: (row) => relativeTime(row.timestamp),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title="Platform Overview"
        description="System health, operations, and key metrics."
        actions={
          <Badge variant="success">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
            All systems operational
          </Badge>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total users"
          value={adminStats.totalUsers.toLocaleString()}
          sub={`${adminStats.newUsersThisMonth} new this month`}
          trend={{ value: 11, label: "vs last month" }}
          icon={<UsersIcon />}
        />
        <MetricCard
          label="Enrollments"
          value={adminStats.totalEnrollments.toLocaleString()}
          sub="total across all courses"
          icon={<LayersIcon />}
        />
        <MetricCard
          label="Revenue"
          value={formatCurrency(adminStats.totalRevenue)}
          sub="lifetime gross revenue"
          trend={{ value: 9, label: "vs last month" }}
          icon={<DollarIcon />}
        />
        <MetricCard
          label="Active users"
          value={adminStats.activeUsers.toLocaleString()}
          sub="last 30 days"
          icon={<ActivityIcon />}
        />
      </div>

      {/* Alerts */}
      {(adminStats.pendingVerifications > 0 || adminStats.openSupportTickets > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {adminStats.pendingVerifications > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              <span className="text-amber-600 text-sm font-semibold">
                {adminStats.pendingVerifications}
              </span>
              <span className="text-amber-700 text-sm">pending email verifications</span>
              <Btn variant="ghost" size="sm" onClick={() => onNavigate("admin-users")}>
                Review →
              </Btn>
            </div>
          )}
          {adminStats.openSupportTickets > 0 && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-4 py-2.5">
              <span className="text-sky-600 text-sm font-semibold">
                {adminStats.openSupportTickets}
              </span>
              <span className="text-sky-700 text-sm">open support tickets</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-semibold text-stone-900">Monthly revenue</h2>
            <span className="text-xs text-stone-400 font-mono">Last 7 months</span>
          </div>
          <BarChart
            data={adminStats.revenueByMonth.map((d) => ({
              ...d,
              display: Math.round(d.amount / 1000),
            }))}
            valueKey="amount"
            labelKey="month"
            color="#4f46e5"
          />
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-4">
              Platform health
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Course catalogue",
                  value: `${adminStats.totalCourses} courses`,
                  status: "healthy",
                },
                {
                  label: "Published courses",
                  value: `${courses.filter((c) => c.published).length} active`,
                  status: "healthy",
                },
                { label: "Payment gateway", value: "Stripe — connected", status: "healthy" },
                { label: "Email service", value: "Operational", status: "healthy" },
                { label: "Storage", value: "62% used", status: "warn" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${item.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    <span className="text-xs font-mono text-stone-500">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
              Quick actions
            </h3>
            <div className="flex flex-col gap-2">
              <Btn
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => onNavigate("admin-users")}
              >
                Manage users
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => onNavigate("admin-payments")}
              >
                Review payments
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => onNavigate("admin-certificates")}
              >
                Issue certificate
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => onNavigate("admin-audit")}
              >
                View audit log
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white border border-stone-200 rounded-xl mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-display text-base font-semibold text-stone-900">Recent payments</h2>
          <Btn variant="ghost" size="sm" onClick={() => onNavigate("admin-payments")}>
            View all →
          </Btn>
        </div>
        <DataTable columns={paymentCols} rows={adminPayments.slice(0, 4)} />
      </div>

      {/* Audit log */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-display text-base font-semibold text-stone-900">
            Recent audit events
          </h2>
          <Btn variant="ghost" size="sm" onClick={() => onNavigate("admin-audit")}>
            View all →
          </Btn>
        </div>
        <DataTable columns={auditCols} rows={auditLogs.slice(0, 4)} />
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 13c0-2.5 2-3.5 4.5-3.5s4.5 1 4.5 3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 4a2 2 0 1 1 0 4M12 9.5c2 0 3 1 3 3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 6l6-3.5L14 6l-6 3.5L2 6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M2 10l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
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
function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline
        points="1,8 4,5 7,10 10,3 13,8 15,6"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
