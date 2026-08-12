import { type ReactNode } from 'react'
import { initials } from '@/lib/data'

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarPalettes = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
]

function hashName(name: string): number {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  src?: string
}

export function Avatar({ name, size = 'md', src }: AvatarProps) {
  const palette = avatarPalettes[hashName(name) % avatarPalettes.length]
  const sizeClass = { xs: 'w-6 h-6 text-[10px]', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }[size]
  if (src) {
    return <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover ring-2 ring-white`} />
  }
  return (
    <div className={`${sizeClass} ${palette} rounded-full flex items-center justify-center font-semibold shrink-0 select-none`}>
      {initials(name)}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const badgeClasses: Record<BadgeVariant, string> = {
  default: 'bg-indigo-50 text-indigo-700 ring-indigo-200/60',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200/60',
  info: 'bg-sky-50 text-sky-700 ring-sky-200/60',
  neutral: 'bg-stone-100 text-stone-600 ring-stone-200/60',
}

export function Badge({ variant = 'default', children, className = '' }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 font-mono ${badgeClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function StatusDot({ variant }: { variant: BadgeVariant }) {
  const dotClasses: Record<BadgeVariant, string> = {
    default: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-stone-400',
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressProps {
  value: number
  max?: number
  size?: 'xs' | 'sm' | 'md'
  color?: string
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, size = 'sm', color = 'bg-indigo-500', showLabel = false, className = '' }: ProgressProps) {
  const pct = Math.min(100, (value / max) * 100)
  const h = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' }[size]
  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      <div className={`flex-1 bg-stone-100 rounded-full overflow-hidden ${h}`}>
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-mono text-stone-500 shrink-0 w-8 text-right">{Math.round(pct)}%</span>}
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: { value: number; label: string }
  icon?: ReactNode
  accent?: string
}

export function MetricCard({ label, value, sub, trend, icon, accent = 'text-indigo-600' }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3 hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">{label}</span>
        {icon && <div className={`${accent} opacity-70`}>{icon}</div>}
      </div>
      <div>
        <div className={`text-2xl font-bold font-display text-stone-900 leading-none`}>{value}</div>
        {sub && <div className="text-xs text-stone-400 mt-1 font-mono">{sub}</div>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-stone-400 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-stone-800 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 max-w-xs">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  breadcrumb,
  description,
  actions,
}: {
  title: string
  breadcrumb?: Array<{ label: string; onClick?: () => void }>
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 mb-7">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {crumb.onClick ? (
                <button onClick={crumb.onClick} className="hover:text-stone-600 transition-colors">{crumb.label}</button>
              ) : (
                <span className="text-stone-600">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">{title}</h1>
          {description && <p className="text-sm text-stone-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const btnVariants: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
}
const btnSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export function Btn({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  children,
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all ${btnVariants[variant]} ${btnSizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input({
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  className = '',
}: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  type?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border border-stone-200 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all ${icon ? 'pl-9 pr-3' : 'px-3'} py-2`}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────

export function Select({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white border border-stone-200 rounded-lg text-sm text-stone-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-stone-200 ${onClick ? 'cursor-pointer hover:border-stone-300 hover:shadow-sm transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; count?: number }>
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-0 border-b border-stone-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
            active === tab.id
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-mono ${active === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-100 text-stone-500'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Data Table ───────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  mono?: boolean
  width?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: Column<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<TableIcon />}
        title="No records found"
        body="No items match your current filters."
      />
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider ${col.width ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`group ${onRowClick ? 'cursor-pointer hover:bg-stone-50' : ''} transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-stone-700 ${col.mono ? 'font-mono text-xs' : ''}`}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-stone-200 p-6 w-full max-w-sm mx-4">
        <h3 className="font-display text-lg font-semibold text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-600 mb-6">{body}</p>
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant={variant} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

export function BarChart({
  data,
  valueKey = 'count',
  labelKey = 'month',
  color = '#6366f1',
}: {
  data: Record<string, unknown>[]
  valueKey?: string
  labelKey?: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0))
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0
        const pct = max > 0 ? (val / max) * 100 : 0
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-t-sm" style={{ height: `${pct}%`, backgroundColor: color, minHeight: 2 }} title={`${d[labelKey]}: ${val}`} />
            <span className="text-[10px] text-stone-400 font-mono">{String(d[labelKey])}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Ring Progress ────────────────────────────────────────────────────────────

export function RingProgress({ value, size = 48, stroke = 4, color = '#6366f1' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e5e4" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}
