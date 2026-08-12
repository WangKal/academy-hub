import { useState } from 'react'
import { courses, formatDuration } from '@/lib/data'
import { Badge } from '@/components/ui'

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void
  onSignIn: () => void
}

const categories = ['Engineering', 'Data Science', 'Design', 'AI & ML', 'Cloud']

const features = [
  {
    icon: '🎯',
    title: 'Structured learning paths',
    body: 'Curated modules and lessons designed by domain experts. Progress at your pace, in order.',
  },
  {
    icon: '📊',
    title: 'Progress tracking',
    body: 'Know exactly where you are. Visual dashboards show completion, quiz scores, and time invested.',
  },
  {
    icon: '✅',
    title: 'Assessments & quizzes',
    body: 'Prove your knowledge with graded assessments at the end of every module.',
  },
  {
    icon: '🎓',
    title: 'Verified certificates',
    body: 'Earn certificates with unique verification codes. Share them confidently with employers.',
  },
  {
    icon: '🏢',
    title: 'Team & org learning',
    body: 'Deploy learning at scale across your organization with role-based access and group management.',
  },
  {
    icon: '🎬',
    title: 'Rich lesson formats',
    body: 'Video, reading, and interactive quizzes combined into engaging lesson sequences.',
  },
]

const stats = [
  { value: '8,400+', label: 'Active learners' },
  { value: '94', label: 'Courses available' },
  { value: '31,800+', label: 'Enrollments' },
  { value: '4.7', label: 'Average course rating' },
]

const testimonials = [
  {
    name: 'Yuki Tanaka',
    org: 'Stratos Tech — Senior Engineer',
    avatar: 'YT',
    body: "The Advanced React course was the most rigorous I've taken. The module structure and assessments actually made the knowledge stick.",
    course: 'Advanced React Patterns & Architecture',
  },
  {
    name: 'Fatima Al-Rashid',
    org: 'Apex Industries — Data Analyst',
    avatar: 'FA',
    body: 'I went from zero Python to confidently presenting data analysis to stakeholders. The certificate was a meaningful credential.',
    course: 'Data Science Fundamentals',
  },
  {
    name: 'Omar Hassan',
    org: 'TechCorp SA — Product Designer',
    avatar: 'OH',
    body: 'UX Design Mastery gave me the vocabulary and process to design with genuine user empathy. Highly recommend for any product person.',
    course: 'UX Design Mastery',
  },
]

const avatarPalettes = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
]

export default function HomePage({ onNavigate, onSignIn }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = courses
    .filter((c) => c.published)
    .filter((c) => activeCategory === 'All' || c.category === activeCategory)
    .filter((c) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const featuredCourse = courses.find((c) => c.published && c.enrolled > 800)

  return (
    <div className="min-h-screen bg-bg transition-theme">

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(var(--ink-1) 1px, transparent 1px), linear-gradient(90deg, var(--ink-1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Indigo glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Enterprise-grade learning for modern teams
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink-1 leading-[1.05] mb-6">
              Master the skills that{' '}
              <span className="text-indigo-600 dark:text-indigo-400 italic">matter most</span>{' '}
              in your field.
            </h1>

            <p className="text-lg sm:text-xl text-ink-3 leading-relaxed mb-8 max-w-xl">
              Academy Hub brings expert-led, structured courses to individuals and teams. Learn at your pace, earn verified certificates, and track every step of your progress.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('catalogue')}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm sm:text-base"
              >
                Explore courses
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3 font-semibold rounded-xl border text-sm sm:text-base transition-all"
                style={{ background: 'var(--surface)', color: 'var(--ink-1)', borderColor: 'var(--edge)' }}
              >
                Create free account
              </button>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t" style={{ borderColor: 'var(--edge)' }}>
              {stats.map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <div className="font-display text-xl font-semibold text-ink-1">{s.value}</div>
                  <div className="text-xs text-ink-4 font-mono">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Course search / quick discovery ──────────────────────────────── */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-1 mb-2">Find your next course</h2>
            <p className="text-ink-3 text-sm sm:text-base">Search by topic, skill, or instructor</p>
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-4 w-5 h-5" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="React, machine learning, UX design…"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm text-ink-1 placeholder-ink-4 border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-surface text-ink-3 border hover:border-indigo-300 hover:text-indigo-600'
                }`}
                style={activeCategory !== cat ? { borderColor: 'var(--edge)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Course grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.slice(0, 6).map((course) => (
                <PublicCourseCard
                  key={course.id}
                  course={course}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-display text-lg font-semibold text-ink-2 mb-1">No courses found</h3>
              <p className="text-sm text-ink-3 mb-4">Try adjusting your search or category.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All') }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('catalogue')}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all hover:border-indigo-300 hover:text-indigo-600"
              style={{ background: 'var(--surface)', color: 'var(--ink-2)', borderColor: 'var(--edge)' }}
            >
              View all {courses.filter((c) => c.published).length} courses →
            </button>
          </div>
        </div>
      </section>

      {/* ─── Featured course ───────────────────────────────────────────────── */}
      {featuredCourse && (
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center rounded-2xl overflow-hidden border p-6 sm:p-8"
              style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}>
              <div className="flex-1 order-2 lg:order-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">⭐ Most popular</Badge>
                  <Badge variant="neutral">{featuredCourse.level}</Badge>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-1 mb-3 leading-tight">
                  {featuredCourse.title}
                </h2>
                <p className="text-ink-3 text-sm leading-relaxed mb-4">{featuredCourse.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-4 font-mono mb-6">
                  <span>⭐ {featuredCourse.rating} rating</span>
                  <span>{featuredCourse.enrolled.toLocaleString()} students</span>
                  <span>{featuredCourse.totalLessons} lessons</span>
                  <span>{formatDuration(featuredCourse.totalDuration)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate('course-detail', { courseId: featuredCourse.id })}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all"
                  >
                    View course
                  </button>
                  <span className="text-lg font-bold text-ink-1">${featuredCourse.price}</span>
                </div>
              </div>
              <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2">
                <img
                  src={featuredCourse.coverImage}
                  alt={featuredCourse.title}
                  className="w-full h-48 sm:h-56 object-cover rounded-xl bg-stone-100"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-20" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-1 mb-3">
              Everything you need to learn effectively
            </h2>
            <p className="text-ink-3 max-w-md mx-auto text-sm sm:text-base">
              Academy Hub is built for serious learners. Every feature is designed to support real skill development, not superficial completion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-5 border transition-all hover:border-indigo-200 dark:hover:border-indigo-800"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-sm text-ink-1 mb-2">{f.title}</h3>
                <p className="text-xs text-ink-3 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-1 mb-3">Your learning journey</h2>
            <p className="text-ink-3 text-sm sm:text-base">From discovery to certificate in a clear, supported path.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discover', body: 'Search and filter through our expert-curated catalogue.' },
              { step: '02', title: 'Enroll', body: 'Purchase a course and get immediate lifetime access.' },
              { step: '03', title: 'Learn', body: 'Progress through structured modules at your own pace.' },
              { step: '04', title: 'Achieve', body: 'Complete quizzes, finish the course, earn your certificate.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-base font-semibold text-ink-1 mb-2">{item.title}</h3>
                <p className="text-xs text-ink-3 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-1 mb-3">Trusted by learners worldwide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="rounded-xl p-6 border"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              >
                <p className="text-sm text-ink-2 leading-relaxed mb-5 italic">"{t.body}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarPalettes[i % avatarPalettes.length]}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink-1">{t.name}</div>
                    <div className="text-[10px] text-ink-4 font-mono">{t.org}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-[10px] text-indigo-500 font-mono" style={{ borderColor: 'var(--edge)' }}>
                  {t.course}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-1 mb-4">
            Start learning today.
          </h2>
          <p className="text-ink-3 mb-8 text-sm sm:text-base">
            Join thousands of professionals advancing their skills with Academy Hub. Your next course is waiting.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              className="px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              Get started for free
            </button>
            <button
              onClick={() => onNavigate('catalogue')}
              className="px-7 py-3.5 font-semibold rounded-xl border transition-all"
              style={{ background: 'var(--surface)', color: 'var(--ink-2)', borderColor: 'var(--edge)' }}
            >
              Browse courses
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Public Course Card ───────────────────────────────────────────────────────

function PublicCourseCard({ course, onNavigate }: { course: ReturnType<typeof courses>[0]; onNavigate: (p: string, params?: Record<string, string>) => void }) {
  const levelColor: Record<string, 'success' | 'warning' | 'info'> = { Beginner: 'success', Intermediate: 'warning', Advanced: 'info' }
  return (
    <button
      onClick={() => onNavigate('course-detail', { courseId: course.id })}
      className="text-left rounded-xl overflow-hidden border transition-all hover:shadow-md group"
      style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
    >
      <div className="relative overflow-hidden">
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-40 object-cover bg-stone-100 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={levelColor[course.level] ?? 'neutral'}>{course.level}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] font-mono text-ink-4 mb-1">{course.category}</div>
        <h3 className="text-sm font-semibold text-ink-1 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <div className="text-xs text-ink-4 mb-3">{course.instructor.name}</div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-ink-4">
            <span>⭐ {course.rating}</span>
            <span>·</span>
            <span>{course.enrolled.toLocaleString()}</span>
          </div>
          <span className="font-bold text-ink-1">${course.price}</span>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t text-[10px] text-ink-4 font-mono" style={{ borderColor: 'var(--edge)' }}>
          <span>{course.totalLessons} lessons</span>
          <span>·</span>
          <span>{formatDuration(course.totalDuration)}</span>
        </div>
      </div>
    </button>
  )
}
