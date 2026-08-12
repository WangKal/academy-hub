import { useState, type ReactNode } from 'react'
import { type Role, type User, notifications } from '@/lib/data'
import { Avatar } from '@/components/ui'

// ─── Nav config ───────────────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: ReactNode; section?: string }

const studentNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { id: 'catalogue', label: 'Course Catalogue', icon: <BookOpenIcon /> },
  { id: 'my-courses', label: 'My Courses', icon: <LayersIcon /> },
  { id: 'certificates', label: 'Certificates', icon: <AwardIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
]

const instructorNav: NavItem[] = [
  { id: 'instructor-dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { id: 'course-builder', label: 'Course Builder', icon: <EditIcon /> },
  { id: 'instructor-students', label: 'Students', icon: <UsersIcon /> },
  { id: 'instructor-analytics', label: 'Analytics', icon: <ChartIcon /> },
  { id: 'catalogue', label: 'Browse Catalogue', icon: <BookOpenIcon /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
]

const adminNav: NavItem[] = [
  { id: 'admin-overview', label: 'Overview', icon: <HomeIcon />, section: 'Platform' },
  { id: 'admin-users', label: 'Users', icon: <UsersIcon />, section: 'Platform' },
  { id: 'admin-courses', label: 'Courses', icon: <BookOpenIcon />, section: 'Platform' },
  { id: 'admin-organizations', label: 'Organizations', icon: <BuildingIcon />, section: 'Platform' },
  { id: 'admin-enrollments', label: 'Enrollments', icon: <LayersIcon />, section: 'Operations' },
  { id: 'admin-payments', label: 'Payments', icon: <CreditCardIcon />, section: 'Operations' },
  { id: 'admin-certificates', label: 'Certificates', icon: <AwardIcon />, section: 'Operations' },
  { id: 'admin-audit', label: 'Audit Logs', icon: <ShieldIcon />, section: 'Operations' },
  { id: 'admin-settings', label: 'Settings', icon: <SettingsIcon />, section: 'System' },
]

const navByRole: Record<Role, NavItem[]> = {
  student: studentNav,
  instructor: instructorNav,
  admin: adminNav,
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface ShellProps {
  role: Role
  currentPage: string
  user: User
  onNavigate: (page: string) => void
  onRoleChange: (role: Role) => void
  onSignOut?: () => void
  darkMode?: boolean
  onToggleDark?: () => void
  children: ReactNode
}

export default function Shell({ role, currentPage, user, onNavigate, onRoleChange, onSignOut, darkMode, onToggleDark, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unread = notifications.filter((n) => !n.read).length
  const nav = navByRole[role]

  // Group admin nav by section
  const grouped: Record<string, NavItem[]> = {}
  nav.forEach((item) => {
    const sec = item.section ?? 'Main'
    if (!grouped[sec]) grouped[sec] = []
    grouped[sec].push(item)
  })

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const active = currentPage === item.id
      return (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          title={collapsed ? item.label : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            active
              ? 'bg-indigo-600/20 text-white'
              : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <span className={`shrink-0 ${active ? 'text-indigo-400' : ''}`}>{item.icon}</span>
          {!collapsed && <span className="font-medium truncate">{item.label}</span>}
          {!collapsed && active && <span className="ml-auto w-1 h-4 rounded-full bg-indigo-400" />}
        </button>
      )
    })

  return (
    <div className="flex h-full overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside
        className="sidebar-enter flex flex-col bg-gray-900 border-r border-gray-800 shrink-0 z-20"
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo + collapse */}
        <div className={`flex items-center h-14 px-3 border-b border-gray-800 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="font-display font-semibold text-white text-sm tracking-wide">Academy Hub</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
            >
              <ChevronLeftIcon />
            </button>
          )}
        </div>

        {/* Role picker */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-gray-800">
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {(['student', 'instructor', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                    role === r ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {r === 'admin' ? 'Admin' : r === 'instructor' ? 'Teach' : 'Learn'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section} className="mb-2">
              {!collapsed && section !== 'Main' && (
                <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">{section}</div>
              )}
              {renderNavItems(items)}
            </div>
          ))}
        </nav>

        {/* Collapse toggle when collapsed */}
        {collapsed && (
          <div className="px-2 py-2 border-t border-gray-800">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex justify-center text-gray-500 hover:text-gray-300 py-1.5 rounded-lg hover:bg-gray-800 transition-all"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}

        {/* User identity */}
        {!collapsed && (
          <div className="border-t border-gray-800 p-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-200 truncate">{user.name}</div>
                <div className="text-[10px] text-gray-500 capitalize font-mono">{user.role}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center px-4 gap-3 shrink-0 z-10 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, students…"
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg placeholder-ink-4 text-ink-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--edge)', border: '1px solid var(--edge)' }}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-300 font-mono hidden sm:block">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {/* Dark mode toggle */}
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 rounded-lg transition-all"
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M11.54 4.46l-1.41 1.41M4.95 11.54l-1.41 1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 9.5A6.5 6.5 0 0 1 6.5 2 6.5 6.5 0 1 0 14 9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                )}
              </button>
            )}
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="relative p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all"
              >
                <BellIcon />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                    <span className="text-sm font-semibold text-stone-800">Notifications</span>
                    <span className="text-xs text-stone-400 font-mono">{unread} unread</span>
                  </div>
                  <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-stone-300'}`} />
                          <div>
                            <div className="text-xs font-semibold text-stone-800">{n.title}</div>
                            <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{n.body}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-stone-100">
                    <button onClick={() => { onNavigate('notifications'); setNotifOpen(false) }} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                <Avatar name={user.name} size="sm" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-ink-1">{user.name}</div>
                  <div className="text-[10px] text-ink-4 font-mono capitalize">{user.role}</div>
                </div>
                <ChevronDownIcon />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl z-50 py-1 border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
                  <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--edge)' }}>
                    <div className="text-xs font-medium text-ink-1">{user.name}</div>
                    <div className="text-xs text-ink-4 font-mono">{user.email}</div>
                  </div>
                  {['Profile', 'Settings', 'Help'].map((item) => (
                    <button key={item} className="w-full text-left px-3 py-1.5 text-sm text-ink-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                      {item}
                    </button>
                  ))}
                  <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--edge)' }}>
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      onClick={() => { setProfileOpen(false); onSignOut?.() }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-fade">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for dropdowns */}
      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setProfileOpen(false) }} />
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 6.5L8 1.5l6.5 5V14a.5.5 0 0 1-.5.5H10V10H6v4.5H2a.5.5 0 0 1-.5-.5V6.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}
function BookOpenIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13.5c0 0-5.5-2-5.5-8V2.5L8 4.5l5.5-2V5.5c0 6-5.5 8-5.5 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><line x1="8" y1="4.5" x2="8" y2="13.5" stroke="currentColor" strokeWidth="1.3"/></svg>
}
function LayersIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6l6-3.5L14 6l-6 3.5L2 6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M2 10l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}
function AwardIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 9.5 4 14l4-2 4 2-1.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a5 5 0 0 1 5 5v3.5l1.5 1.5H1.5L3 10V6.5a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3"/></svg>
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 13.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 13c0-2.5 2-3.5 4.5-3.5s4.5 1 4.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10.5 4a2 2 0 1 1 0 4M12 9.5c2 0 3 1 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 12.5 6.5 5.5 13.5H2.5v-3L9.5 3.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><line x1="8" y1="5" x2="11" y2="8" stroke="currentColor" strokeWidth="1.3"/></svg>
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="6.5" y="5" width="3" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="2.5" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
}
function BuildingIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7h12" stroke="currentColor" strokeWidth="1.3"/><path d="M6 7v7M10 7v7" stroke="currentColor" strokeWidth="1.3"/><path d="M5 3V2h6v1" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}
function CreditCardIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><line x1="1.5" y1="7" x2="14.5" y2="7" stroke="currentColor" strokeWidth="1.3"/><rect x="3.5" y="9" width="4" height="1.5" rx="0.5" fill="currentColor"/></svg>
}
function ShieldIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5 2.5 4v4c0 3 2.5 5.5 5.5 6 3-0.5 5.5-3 5.5-6V4L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.7 3.7l1.4 1.4M10.9 10.9l1.4 1.4M3.7 12.3l1.4-1.4M10.9 5.1l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function ChevronLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function ChevronDownIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function SearchIcon({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
