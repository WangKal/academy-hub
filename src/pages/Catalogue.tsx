import { useState, useMemo } from 'react'
import { courses, studentEnrollments, formatDuration, type Course } from '@/lib/data'
import { Badge, Input, Select, PageHeader, Btn, ProgressBar } from '@/components/ui'

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

const categories = ['All', 'Engineering', 'Data Science', 'Design', 'AI & ML', 'Cloud']
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
const sortOptions = [
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export default function Catalogue({ onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [sort, setSort] = useState('popular')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    let list = [...courses]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.instructor.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      )
    }
    if (category !== 'All') list = list.filter((c) => c.category === category)
    if (level !== 'All') list = list.filter((c) => c.level === level)

    list.sort((a, b) => {
      if (sort === 'popular') return b.enrolled - a.enrolled
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return 0
    })
    return list
  }, [search, category, level, sort])

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title="Course Catalogue"
        description={`${courses.length} courses across engineering, design, data science, and more.`}
        actions={
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white shadow-sm text-stone-700' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-stone-700' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <ListIcon />
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search courses…"
          value={search}
          onChange={setSearch}
          icon={<SearchIcon />}
          className="flex-1 min-w-48"
        />

        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Select
          value={level}
          onChange={setLevel}
          options={levels.map((l) => ({ value: l, label: l }))}
          className="text-xs"
        />

        <Select
          value={sort}
          onChange={setSort}
          options={sortOptions}
          className="text-xs"
        />

        {(search || category !== 'All' || level !== 'All') && (
          <button
            onClick={() => { setSearch(''); setCategory('All'); setLevel('All') }}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          Showing <span className="font-semibold text-stone-700">{filtered.length}</span> of {courses.length} courses
        </p>
      </div>

      {/* Grid / List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((course) => (
            <CourseListRow key={course.id} course={course} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-display text-lg font-semibold text-stone-700 mb-1">No courses found</h3>
          <p className="text-sm text-stone-400">Try adjusting your filters or search terms.</p>
          <Btn variant="secondary" size="sm" className="mt-4" onClick={() => { setSearch(''); setCategory('All'); setLevel('All') }}>
            Clear filters
          </Btn>
        </div>
      )}
    </div>
  )
}

// ─── Course Card (Grid) ───────────────────────────────────────────────────────

function CourseCard({ course, onNavigate }: { course: Course; onNavigate: (p: string, params?: Record<string, string>) => void }) {
  const enrollment = studentEnrollments.find((e) => e.courseId === course.id)
  const levelColors: Record<string, 'success' | 'warning' | 'info'> = {
    Beginner: 'success', Intermediate: 'warning', Advanced: 'info',
  }

  return (
    <button
      onClick={() => onNavigate('course-detail', { courseId: course.id })}
      className="text-left bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-md transition-all group"
    >
      <div className="relative overflow-hidden">
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-44 object-cover bg-stone-100 group-hover:scale-105 transition-transform duration-300"
        />
        {!course.published && (
          <div className="absolute top-2 left-2">
            <Badge variant="warning">Draft</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={levelColors[course.level] ?? 'neutral'}>{course.level}</Badge>
        </div>
        {enrollment && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressBar value={enrollment.progress} size="xs" color="bg-indigo-500" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-stone-400 font-mono mb-1">{course.category}</div>
        <h3 className="text-sm font-semibold text-stone-900 leading-snug mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">{course.title}</h3>
        <div className="text-xs text-stone-500 mb-3">{course.instructor.name}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>⭐ {course.rating}</span>
            <span>·</span>
            <span>{course.enrolled.toLocaleString()} students</span>
          </div>
          <div>
            {enrollment ? (
              <Badge variant={enrollment.status === 'completed' ? 'success' : 'default'}>
                {enrollment.status === 'completed' ? '✓ Done' : `${enrollment.progress}%`}
              </Badge>
            ) : (
              <span className="text-sm font-bold text-stone-900">${course.price}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
          <span>{course.totalLessons} lessons</span>
          <span>·</span>
          <span>{formatDuration(course.totalDuration)}</span>
        </div>
      </div>
    </button>
  )
}

// ─── Course Row (List) ────────────────────────────────────────────────────────

function CourseListRow({ course, onNavigate }: { course: Course; onNavigate: (p: string, params?: Record<string, string>) => void }) {
  const enrollment = studentEnrollments.find((e) => e.courseId === course.id)
  return (
    <button
      onClick={() => onNavigate('course-detail', { courseId: course.id })}
      className="w-full text-left bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 hover:border-stone-300 hover:shadow-sm transition-all group"
    >
      <img src={course.coverImage} alt={course.title} className="w-24 h-16 rounded-lg object-cover bg-stone-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono text-stone-400">{course.category}</span>
          <span className="text-[10px] font-mono text-stone-300">·</span>
          <span className="text-[10px] font-mono text-stone-400">{course.level}</span>
        </div>
        <h3 className="text-sm font-semibold text-stone-900 group-hover:text-indigo-700 transition-colors">{course.title}</h3>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{course.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
          <span>{course.instructor.name}</span>
          <span>·</span>
          <span>⭐ {course.rating}</span>
          <span>·</span>
          <span>{course.totalLessons} lessons · {formatDuration(course.totalDuration)}</span>
        </div>
        {enrollment && (
          <div className="mt-2 max-w-xs">
            <ProgressBar value={enrollment.progress} size="xs" showLabel />
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        {enrollment ? (
          <Badge variant={enrollment.status === 'completed' ? 'success' : 'default'}>
            {enrollment.status === 'completed' ? '✓ Complete' : `${enrollment.progress}%`}
          </Badge>
        ) : (
          <div className="text-lg font-bold text-stone-900">${course.price}</div>
        )}
        <div className="text-[10px] text-stone-400 font-mono mt-0.5">{course.enrolled.toLocaleString()} enrolled</div>
      </div>
    </button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GridIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
}
function ListIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="1" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="1" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
