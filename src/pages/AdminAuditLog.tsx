import { useState } from 'react'
import { auditLogs, relativeTime, type AuditLog } from '@/lib/data'
import { PageHeader, Badge, Input, Select, DataTable, type Column } from '@/components/ui'

interface Props {
  onNavigate: (page: string) => void
}

export default function AdminAuditLog({ onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')

  const filtered = auditLogs.filter((l) => {
    if (search && !l.actor.toLowerCase().includes(search.toLowerCase()) && !l.action.includes(search.toLowerCase()) && !l.target.toLowerCase().includes(search.toLowerCase())) return false
    if (severityFilter !== 'all' && l.severity !== severityFilter) return false
    return true
  })

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      mono: true,
      render: (row) => (
        <div>
          <div className="text-xs font-mono text-stone-600">{new Date(row.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-[10px] text-stone-400">{new Date(row.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (row) => {
        const v = { high: 'danger', medium: 'warning', low: 'neutral' } as const
        return <Badge variant={v[row.severity]}>{row.severity}</Badge>
      },
    },
    {
      key: 'actor',
      label: 'Actor',
      render: (row) => <span className="font-medium text-stone-800">{row.actor}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      mono: true,
      render: (row) => (
        <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-mono text-stone-700">{row.action}</span>
      ),
    },
    { key: 'target', label: 'Target' },
    {
      key: 'ip',
      label: 'IP',
      mono: true,
      render: (row) => <span className="text-stone-400">{row.ip}</span>,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title="Audit Log"
        description="Complete record of administrative and system activity."
        breadcrumb={[{ label: 'Admin', onClick: () => onNavigate('admin-overview') }, { label: 'Audit Log' }]}
      />

      {/* Severity summary */}
      <div className="flex flex-wrap gap-3 mb-5">
        {(['high', 'medium', 'low'] as const).map((sev) => {
          const count = auditLogs.filter((l) => l.severity === sev).length
          const v = { high: 'danger', medium: 'warning', low: 'neutral' } as const
          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all capitalize ${
                severityFilter === sev ? 'border-stone-300 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Badge variant={v[sev]}>{sev}</Badge>
              <span className="font-mono text-stone-600">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <Input placeholder="Search actor, action, or target…" value={search} onChange={setSearch} icon={<SearchIcon />} className="flex-1 min-w-48" />
        <Select
          value={severityFilter}
          onChange={setSeverityFilter}
          options={[
            { value: 'all', label: 'All severities' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />
        <span className="text-xs text-stone-400 font-mono">{filtered.length} events</span>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <DataTable columns={columns} rows={filtered} />
      </div>
    </div>
  )
}

function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
