import { useState, useEffect } from 'react'
import {
  type Role,
  currentUsers,
  courses,
  studentEnrollments,
  adminUsers,
  certificates,
  notifications,
  instructorStudents,
  relativeTime,
  instructorStats,
  type User,
  type Enrollment,
  type Course,
} from '@/lib/data'
import Shell from '@/components/Shell'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'

// Public pages
import HomePage from '@/pages/public/HomePage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import ForgotPassword from '@/pages/public/ForgotPassword'
import VerificationPage from '@/pages/public/VerificationPage'

// Authenticated pages
import StudentDashboard from '@/pages/StudentDashboard'
import Catalogue from '@/pages/Catalogue'
import CourseDetail from '@/pages/CourseDetail'
import CoursePlayer from '@/pages/CoursePlayer'
import Certificates from '@/pages/Certificates'
import InstructorDashboard from '@/pages/InstructorDashboard'
import CourseBuilder from '@/pages/CourseBuilder'
import AdminOverview from '@/pages/AdminOverview'
import AdminUsers from '@/pages/AdminUsers'
import AdminPayments from '@/pages/AdminPayments'
import AdminAuditLog from '@/pages/AdminAuditLog'

import { PageHeader, Badge, Avatar, ProgressBar, MetricCard, DataTable, type Column, BarChart, Btn } from '@/components/ui'

type Page = string

interface RouteParams {
  courseId?: string
  [key: string]: string | undefined
}

const defaultPages: Record<Role, Page> = {
  student: 'dashboard',
  instructor: 'instructor-dashboard',
  admin: 'admin-overview',
}

// Full-screen pages (no nav/footer at all)
const FULLSCREEN_PAGES = new Set(['course-player'])

// Auth pages (simplified chrome: back button + dark toggle)
const AUTH_PAGES = new Set(['login', 'register', 'forgot-password', 'verify'])

// Public pages (PublicNav + content + Footer)
const PUBLIC_PAGES = new Set(['home', 'catalogue', 'course-detail'])

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<Role>('student')
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [params, setParams] = useState<RouteParams>({})
  const [darkMode, setDarkMode] = useState(false)

  // Apply dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Load dark preference from localStorage / system
  useEffect(() => {
    const saved = localStorage.getItem('ah-dark')
    if (saved === 'true') setDarkMode(true)
    else if (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  function toggleDark() {
    setDarkMode((prev) => {
      localStorage.setItem('ah-dark', String(!prev))
      return !prev
    })
  }

  function navigate(page: Page, newParams: RouteParams = {}) {
    setCurrentPage(page)
    setParams(newParams)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleSignIn(signInRole?: Role) {
    const targetRole = signInRole ?? 'student'
    setRole(targetRole)
    setIsAuthenticated(true)
    setCurrentPage(defaultPages[targetRole])
    setParams({})
  }

  function handleSignOut() {
    setIsAuthenticated(false)
    setCurrentPage('home')
    setParams({})
  }

  function handleRoleChange(newRole: Role) {
    setRole(newRole)
    setCurrentPage(defaultPages[newRole])
    setParams({})
  }

  const user = currentUsers[role]

  // ─── Full-screen pages (no nav/footer) ────────────────────────────────────
  if (FULLSCREEN_PAGES.has(currentPage)) {
    return (
      <CoursePlayer
        courseId={params.courseId ?? 'crs_001'}
        onNavigate={navigate}
      />
    )
  }

  // ─── Auth pages (full-screen auth forms, minimal chrome) ──────────────────
  if (AUTH_PAGES.has(currentPage)) {
    return (
      <div className="transition-theme" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => navigate('home')}
            className="text-sm text-ink-3 hover:text-ink-1 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-ink-3 hover:text-ink-1 transition-all"
            style={{ background: 'var(--surface-2)' }}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
        {currentPage === 'login' && <LoginPage onNavigate={navigate} onSignIn={handleSignIn} />}
        {currentPage === 'register' && <RegisterPage onNavigate={navigate} onSignIn={handleSignIn} />}
        {currentPage === 'forgot-password' && <ForgotPassword onNavigate={navigate} />}
        {currentPage === 'verify' && <VerificationPage onNavigate={navigate} onSignIn={() => handleSignIn('student')} />}
      </div>
    )
  }

  // ─── Public pages (PublicNav + content + Footer) ──────────────────────────
  if (!isAuthenticated || PUBLIC_PAGES.has(currentPage)) {
    const showFooter = currentPage !== 'catalogue'
    return (
      <div className="flex flex-col min-h-screen transition-theme" style={{ background: 'var(--bg)' }}>
        <PublicNav
          currentPage={currentPage}
          onNavigate={navigate}
          onSignIn={() => navigate('login')}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
        <main className="flex-1 page-fade">
          {currentPage === 'home' && <HomePage onNavigate={navigate} onSignIn={handleSignIn} />}
          {currentPage === 'catalogue' && (
            <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
              <Catalogue onNavigate={navigate} />
            </div>
          )}
          {currentPage === 'course-detail' && (
            <CourseDetail courseId={params.courseId ?? 'crs_001'} onNavigate={navigate} />
          )}
          {!['home', 'catalogue', 'course-detail'].includes(currentPage) && (
            <HomePage onNavigate={navigate} onSignIn={handleSignIn} />
          )}
        </main>
        {showFooter && <PublicFooter onNavigate={navigate} />}
      </div>
    )
  }

  // ─── Authenticated Shell ──────────────────────────────────────────────────
  return (
    <Shell
      role={role}
      currentPage={currentPage}
      user={user}
      onNavigate={navigate}
      onRoleChange={handleRoleChange}
      onSignOut={handleSignOut}
      darkMode={darkMode}
      onToggleDark={toggleDark}
    >
      <AuthPageContent role={role} page={currentPage} params={params} onNavigate={navigate} />
    </Shell>
  )
}

// ─── Authenticated page content router ───────────────────────────────────────

function AuthPageContent({
  role, page, params, onNavigate,
}: {
  role: Role
  page: Page
  params: RouteParams
  onNavigate: (page: Page, params?: RouteParams) => void
}) {
  if (page === 'dashboard') return <StudentDashboard onNavigate={onNavigate} />
  if (page === 'catalogue') return <Catalogue onNavigate={onNavigate} />
  if (page === 'course-detail') return <CourseDetail courseId={params.courseId ?? 'crs_001'} onNavigate={onNavigate} />
  if (page === 'my-courses') return <MyCourses onNavigate={onNavigate} />
  if (page === 'certificates') return <Certificates onNavigate={onNavigate} />
  if (page === 'notifications') return <NotificationsPage />
  if (page === 'profile') return <ProfilePage role={role} />

  if (page === 'instructor-dashboard') return <InstructorDashboard onNavigate={onNavigate} />
  if (page === 'course-builder') return <CourseBuilder courseId={params.courseId} onNavigate={onNavigate} />
  if (page === 'instructor-students') return <InstructorStudentsPage />
  if (page === 'instructor-analytics') return <InstructorAnalyticsPage />

  if (page === 'admin-overview') return <AdminOverview onNavigate={onNavigate} />
  if (page === 'admin-users') return <AdminUsers onNavigate={onNavigate} />
  if (page === 'admin-courses') return <AdminCoursesPage />
  if (page === 'admin-enrollments') return <AdminEnrollmentsPage />
  if (page === 'admin-payments') return <AdminPayments onNavigate={onNavigate} />
  if (page === 'admin-certificates') return <AdminCertificatesPage />
  if (page === 'admin-audit') return <AdminAuditLog onNavigate={onNavigate} />
  if (page === 'admin-organizations') return <AdminOrganizationsPage />
  if (page === 'admin-settings') return <AdminSettingsPage />

  return <NotFoundPage onNavigate={onNavigate} />
}

// ─── Inline stub pages ────────────────────────────────────────────────────────

function MyCourses({ onNavigate }: { onNavigate: (p: string, params?: RouteParams) => void }) {
  const enrolled = studentEnrollments.map((e) => ({
    course: courses.find((c) => c.id === e.courseId)!,
    enrollment: e,
  })).filter((x) => x.course)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="My Courses" description={`${enrolled.length} courses in your library.`} />
      <div className="space-y-4">
        {enrolled.map(({ course, enrollment }) => (
          <div
            key={course.id}
            className="rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 border hover:border-stone-300 dark:hover:border-stone-600 transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
          >
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full sm:w-24 h-32 sm:h-16 rounded-lg object-cover shrink-0"
              style={{ background: 'var(--surface-3)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-ink-1 truncate">{course.title}</h3>
                <Badge variant={enrollment.status === 'completed' ? 'success' : 'default'}>
                  {enrollment.status === 'completed' ? '✓ Complete' : 'In progress'}
                </Badge>
              </div>
              <div className="text-xs text-ink-4 mb-2">{course.instructor.name}</div>
              <ProgressBar value={enrollment.progress} size="sm" showLabel />
              <div className="text-xs text-ink-4 mt-1 font-mono">
                {enrollment.completedLessons.length}/{course.totalLessons} lessons · Last accessed {relativeTime(enrollment.lastAccessedAt)}
              </div>
            </div>
            <div className="shrink-0">
              <Btn
                size="sm"
                variant={enrollment.status === 'completed' ? 'secondary' : 'primary'}
                onClick={() => onNavigate('course-player', { courseId: course.id })}
              >
                {enrollment.status === 'completed' ? 'Review' : 'Continue'}
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationsPage() {
  const catColors = { learning: 'info', achievement: 'success', admin: 'warning', system: 'neutral' } as const
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Notifications" description={`${notifications.filter((n) => !n.read).length} unread`} />
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl p-4 flex gap-3 border ${!n.read ? 'border-indigo-200 dark:border-indigo-900' : ''}`}
            style={n.read ? { background: 'var(--surface)', borderColor: 'var(--edge)' } : {}}
          >
            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-stone-300'}`} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-ink-1">{n.title}</span>
                <Badge variant={catColors[n.category]}>{n.category}</Badge>
              </div>
              <p className="text-xs text-ink-3">{n.body}</p>
              <div className="text-[10px] text-ink-4 font-mono mt-1">{relativeTime(n.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfilePage({ role }: { role: Role }) {
  const user = currentUsers[role]
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Profile" />
      <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 h-20 sm:h-24" />
        <div className="px-5 sm:px-6 pb-6">
          <div className="-mt-8 mb-4"><Avatar name={user.name} size="lg" /></div>
          <h2 className="font-display text-xl font-semibold text-ink-1">{user.name}</h2>
          <p className="text-sm text-ink-3 capitalize">{user.role} · {user.organization}</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-ink-4 text-xs">Email</span>
              <div className="font-mono text-xs text-ink-2">{user.email}</div>
            </div>
            <div>
              <span className="text-ink-4 text-xs">Member since</span>
              <div className="text-xs text-ink-2">{new Date(user.joinedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstructorStudentsPage() {
  const cols: Column<User>[] = [
    {
      key: 'name', label: 'Student',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar name={r.name} size="sm" />
          <div>
            <div className="text-sm font-medium text-ink-1">{r.name}</div>
            <div className="text-xs text-ink-4 font-mono">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'organization', label: 'Organization', render: (r) => <span className="text-ink-2">{r.organization}</span> },
    { key: 'enrollments', label: 'Courses', mono: true, render: (r) => String(r.enrollments ?? 0) },
    { key: 'status', label: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ]
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Students" description={`${instructorStudents.length} students enrolled in your courses.`} />
      <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
        <DataTable columns={cols} rows={instructorStudents} />
      </div>
    </div>
  )
}

function InstructorAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Analytics" description="Performance metrics across your courses." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Enrollments" value={instructorStats.totalEnrollments.toLocaleString()} trend={{ value: 8, label: 'this month' }} icon={<span className="text-ink-4">📈</span>} />
        <MetricCard label="Completion rate" value={`${instructorStats.avgCompletionRate}%`} icon={<span className="text-ink-4">✓</span>} />
        <MetricCard label="Avg quiz score" value={`${instructorStats.avgQuizScore}%`} icon={<span className="text-ink-4">📝</span>} />
        <MetricCard label="Active students" value={instructorStats.activeStudents.toLocaleString()} icon={<span className="text-ink-4">👥</span>} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
          <h3 className="font-display text-sm font-semibold text-ink-1 mb-4">Monthly enrollments</h3>
          <BarChart data={instructorStats.monthlyEnrollments} valueKey="count" labelKey="month" color="#6366f1" />
        </div>
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
          <h3 className="font-display text-sm font-semibold text-ink-1 mb-4">Progress distribution</h3>
          <div className="space-y-3">
            {instructorStats.progressDistribution.map((d) => (
              <div key={d.range}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-3">{d.range}</span>
                  <span className="font-mono text-ink-4">{d.count}</span>
                </div>
                <ProgressBar value={d.pct} size="sm" color="bg-indigo-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminCoursesPage() {
  const cols: Column<Course>[] = [
    {
      key: 'title', label: 'Course',
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.coverImage} alt="" className="w-10 h-7 rounded object-cover shrink-0" style={{ background: 'var(--surface-3)' }} />
          <span className="text-sm font-medium text-ink-1">{r.title}</span>
        </div>
      ),
    },
    { key: 'instructor', label: 'Instructor', render: (r) => <span className="text-ink-2">{r.instructor.name}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-ink-3">{r.category}</span> },
    { key: 'enrolled', label: 'Enrolled', mono: true, render: (r) => r.enrolled.toLocaleString() },
    { key: 'published', label: 'Status', render: (r) => <Badge variant={r.published ? 'success' : 'warning'}>{r.published ? 'Published' : 'Draft'}</Badge> },
    { key: 'price', label: 'Price', mono: true, render: (r) => `$${r.price}` },
  ]
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Courses" description={`${courses.length} courses in the catalogue.`} />
      <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
        <DataTable columns={cols} rows={courses} />
      </div>
    </div>
  )
}

function AdminEnrollmentsPage() {
  const cols: Column<Enrollment>[] = [
    { key: 'courseId', label: 'Course', render: (r) => <span className="text-ink-2">{courses.find((c) => c.id === r.courseId)?.title ?? r.courseId}</span> },
    { key: 'progress', label: 'Progress', mono: true, render: (r) => `${r.progress}%` },
    {
      key: 'status', label: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'completed' ? 'success' : r.status === 'in_progress' ? 'default' : 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
    { key: 'enrolledAt', label: 'Enrolled', mono: true },
  ]
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Enrollments" description="All student-course enrollments." />
      <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
        <DataTable columns={cols} rows={studentEnrollments} />
      </div>
    </div>
  )
}

function AdminCertificatesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Certificates" description="All issued certificates." actions={<Btn size="sm">Issue certificate</Btn>} />
      <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
        <DataTable
          columns={[
            { key: 'code', label: 'Code', mono: true },
            { key: 'studentName', label: 'Student' },
            { key: 'courseTitle', label: 'Course' },
            { key: 'issuedAt', label: 'Issued', mono: true },
            { key: 'status', label: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'danger'}>{r.status}</Badge> },
          ]}
          rows={certificates}
        />
      </div>
    </div>
  )
}

function AdminOrganizationsPage() {
  const orgs = [...new Set(adminUsers.map((u) => u.organization))].map((org, i) => ({
    id: `org_${i}`,
    name: org,
    members: adminUsers.filter((u) => u.organization === org).length,
  }))
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Organizations" description={`${orgs.length} organizations.`} />
      <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
        <DataTable
          columns={[
            { key: 'name', label: 'Organization', render: (r) => <span className="font-medium text-ink-1">{r.name}</span> },
            { key: 'members', label: 'Members', mono: true },
            { key: 'status', label: 'Status', render: () => <Badge variant="success">Active</Badge> },
          ]}
          rows={orgs}
        />
      </div>
    </div>
  )
}

function AdminSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader title="Platform Settings" description="Configure Academy Hub platform-wide settings." />
      <div className="space-y-5">
        {[
          {
            section: 'General',
            settings: [
              { label: 'Platform name', value: 'Academy Hub', type: 'text' },
              { label: 'Support email', value: 'support@academyhub.io', type: 'text' },
            ],
          },
          {
            section: 'Enrollment',
            settings: [
              { label: 'Allow self-enrollment', value: true, type: 'toggle' },
              { label: 'Require email verification', value: true, type: 'toggle' },
              { label: 'Enable organization SSO', value: false, type: 'toggle' },
            ],
          },
          {
            section: 'Certificates',
            settings: [
              { label: 'Auto-issue on completion', value: true, type: 'toggle' },
              { label: 'Public verification URL', value: true, type: 'toggle' },
            ],
          },
        ].map((group) => (
          <div key={group.section} className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
            <div className="px-5 py-3 border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--edge)' }}>
              <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider">{group.section}</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--edge)' }}>
              {group.settings.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-ink-2">{s.label}</span>
                  {s.type === 'toggle' ? (
                    <button
                      className={`rounded-full relative transition-all ${s.value ? 'bg-indigo-600' : 'bg-stone-200 dark:bg-stone-700'}`}
                      style={{ width: 40, height: 22 }}
                    >
                      <span
                        className="absolute top-0.5 rounded-full bg-white shadow transition-all"
                        style={{ width: 18, height: 18, left: s.value ? 20 : 2 }}
                      />
                    </button>
                  ) : (
                    <input
                      defaultValue={String(s.value)}
                      className="text-sm rounded-lg px-2 py-1 text-ink-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-52"
                      style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <Btn>Save settings</Btn>
      </div>
    </div>
  )
}

function NotFoundPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="font-display text-5xl font-semibold text-ink-4 mb-4">404</div>
      <h2 className="font-display text-xl font-semibold text-ink-1 mb-1">Page not found</h2>
      <p className="text-ink-3 text-sm mb-5">This page does not exist or has been moved.</p>
      <Btn onClick={() => onNavigate('dashboard')}>Go home</Btn>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 9.5A6.5 6.5 0 0 1 6.5 2 6.5 6.5 0 1 0 14 9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M11.54 4.46l-1.41 1.41M4.95 11.54l-1.41 1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
