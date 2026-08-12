import { useState } from 'react'
import { courses, formatDuration } from '@/lib/data'
import { type Course, type Module, type Lesson } from '@/lib/data'
import { Badge, Btn, TabBar, Input } from '@/components/ui'

interface Props {
  courseId?: string
  onNavigate: (page: string) => void
}

type BuilderTab = 'overview' | 'curriculum' | 'quizzes' | 'settings' | 'preview'

export default function CourseBuilder({ courseId, onNavigate }: Props) {
  const course = courseId ? courses.find((c) => c.id === courseId) ?? courses[0] : courses[0]
  const [tab, setTab] = useState<BuilderTab>('curriculum')
  const [title, setTitle] = useState(course.title)
  const [expandedModule, setExpandedModule] = useState<string | null>(course.modules[0]?.id ?? null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'settings', label: 'Settings' },
    { id: 'preview', label: 'Preview' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Builder top bar */}
      <div className="bg-white border-b border-stone-200 px-5 py-3 flex items-center gap-4 shrink-0">
        <button
          onClick={() => onNavigate('instructor-dashboard')}
          className="text-stone-400 hover:text-stone-600 transition-colors text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex-1 max-w-sm">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-medium text-stone-800 bg-transparent border-none focus:outline-none focus:ring-0"
            placeholder="Course title…"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant={course.published ? 'success' : 'warning'}>
            {course.published ? 'Published' : 'Draft'}
          </Badge>
          <Btn variant="secondary" size="sm">Save draft</Btn>
          <Btn size="sm">{course.published ? 'Unpublish' : 'Publish'}</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 px-5">
        <TabBar
          tabs={tabs}
          active={tab}
          onChange={(id) => setTab(id as BuilderTab)}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {tab === 'overview' && <OverviewTab course={course} />}
        {tab === 'curriculum' && (
          <CurriculumTab
            course={course}
            expandedModule={expandedModule}
            setExpandedModule={setExpandedModule}
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
            dragging={dragging}
            setDragging={setDragging}
          />
        )}
        {tab === 'quizzes' && <QuizzesTab course={course} />}
        {tab === 'settings' && <SettingsTab course={course} />}
        {tab === 'preview' && <PreviewTab course={course} />}
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ course }: { course: Course }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
      <h2 className="font-display text-lg font-semibold text-stone-900 mb-5">Course overview</h2>
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Course title</label>
          <Input value={course.title} onChange={() => {}} className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            defaultValue={course.description}
            rows={4}
            className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Category</label>
            <select className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              {['Engineering', 'Data Science', 'Design', 'AI & ML', 'Cloud'].map((c) => (
                <option key={c} selected={c === course.category}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Level</label>
            <select className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <option key={l} selected={l === course.level}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Price (USD)</label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
            <input
              type="number"
              defaultValue={course.price}
              className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Learning outcomes</label>
          <div className="space-y-2">
            {course.outcomes.map((outcome, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={outcome} onChange={() => {}} className="flex-1" />
                <button className="text-stone-400 hover:text-rose-500 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
            <Btn variant="ghost" size="sm">+ Add outcome</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Curriculum Tab ───────────────────────────────────────────────────────────

function CurriculumTab({
  course, expandedModule, setExpandedModule, selectedLesson, setSelectedLesson, dragging, setDragging,
}: {
  course: Course
  expandedModule: string | null
  setExpandedModule: (id: string | null) => void
  selectedLesson: Lesson | null
  setSelectedLesson: (lesson: Lesson | null) => void
  dragging: string | null
  setDragging: (id: string | null) => void
}) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Module tree */}
      <div className="w-80 shrink-0 border-r border-stone-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-800">Curriculum structure</h3>
          <Btn variant="secondary" size="sm">+ Module</Btn>
        </div>

        <div className="p-2 space-y-1">
          {course.modules.map((mod) => {
            const isOpen = expandedModule === mod.id
            return (
              <div key={mod.id} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-50 transition-colors group"
                >
                  <div
                    className="text-stone-400 cursor-grab shrink-0"
                    draggable
                    onDragStart={() => setDragging(mod.id)}
                    onDragEnd={() => setDragging(null)}
                  >
                    <GripIcon />
                  </div>
                  <span className={`flex-1 text-xs font-semibold transition-colors ${isOpen ? 'text-indigo-700' : 'text-stone-700'}`}>
                    {mod.order}. {mod.title}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">{mod.lessons.length}</span>
                  <span className={`text-stone-400 transition-transform text-xs ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {isOpen && (
                  <div className="border-t border-stone-100">
                    {mod.lessons.map((lesson) => {
                      const isSelected = selectedLesson?.id === lesson.id
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full flex items-center gap-2 pl-8 pr-3 py-2 text-left transition-colors ${
                            isSelected ? 'bg-indigo-50 border-l-2 border-indigo-500' : 'hover:bg-stone-50 border-l-2 border-transparent'
                          }`}
                        >
                          <div className="text-stone-300 cursor-grab shrink-0">
                            <GripIcon />
                          </div>
                          <LessonTypeIcon type={lesson.type} />
                          <span className={`flex-1 text-xs truncate ${isSelected ? 'text-indigo-700 font-medium' : 'text-stone-600'}`}>
                            {lesson.title}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">{lesson.duration}m</span>
                        </button>
                      )
                    })}
                    <button className="w-full flex items-center gap-2 pl-8 pr-3 py-2 text-xs text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <span>+</span> Add lesson
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-stone-100">
          <div className="text-xs text-stone-400 font-mono">
            {course.modules.length} modules · {course.totalLessons} lessons · {formatDuration(course.totalDuration)}
          </div>
        </div>
      </div>

      {/* Lesson editor */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedLesson ? (
          <LessonEditor lesson={selectedLesson} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-400">
            <div className="text-4xl mb-3">✏️</div>
            <div className="text-sm font-medium text-stone-600 mb-1">Select a lesson to edit</div>
            <div className="text-xs">Or add a new lesson to a module</div>
          </div>
        )}
      </div>
    </div>
  )
}

function LessonEditor({ lesson }: { lesson: Lesson }) {
  const [title, setTitle] = useState(lesson.title)
  const [type, setType] = useState(lesson.type)

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-5">
        <h3 className="font-display text-lg font-semibold text-stone-900">Edit lesson</h3>
        <Badge variant={type === 'video' ? 'info' : type === 'text' ? 'warning' : 'neutral'}>
          {type}
        </Badge>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Lesson title</label>
          <Input value={title} onChange={setTitle} className="w-full" />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Lesson type</label>
          <div className="flex gap-2">
            {(['video', 'text', 'quiz'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                  type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {type === 'video' && (
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Video</label>
            <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center bg-stone-50 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
              <div className="text-2xl mb-2">🎬</div>
              <div className="text-sm font-medium text-stone-600 mb-1">Upload video or paste URL</div>
              <div className="text-xs text-stone-400">MP4, MOV, WEBM · Max 2GB</div>
              <Btn variant="secondary" size="sm" className="mt-3">Choose file</Btn>
            </div>
          </div>
        )}

        {type === 'text' && (
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">Content</label>
            <textarea
              rows={12}
              placeholder="Write your lesson content in markdown…"
              className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none font-mono"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">
            Preview for non-enrolled students
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked={lesson.preview} className="rounded accent-indigo-600" />
            <span className="text-sm text-stone-700">Allow free preview</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Btn size="sm">Save lesson</Btn>
          <Btn variant="secondary" size="sm">Discard changes</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Quizzes Tab ──────────────────────────────────────────────────────────────

function QuizzesTab({ course }: { course: Course }) {
  const quizLessons = course.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'quiz').map((l) => ({ ...l, module: m.title })))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-stone-900">Quizzes</h2>
          <Btn size="sm">+ New quiz</Btn>
        </div>
        <div className="space-y-3">
          {quizLessons.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-400 font-mono mb-0.5">{quiz.module}</div>
                  <div className="text-sm font-medium text-stone-800">{quiz.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{quiz.duration}m</Badge>
                  <Btn variant="ghost" size="sm">Edit</Btn>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-stone-400 font-mono">
                <span>Passing score: 70%</span>
                <span>·</span>
                <span>Attempts: unlimited</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ course }: { course: Course }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-xl space-y-6">
        <h2 className="font-display text-lg font-semibold text-stone-900">Course settings</h2>
        <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
          {[
            { label: 'Allow enrollment', desc: 'Students can self-enroll', on: true },
            { label: 'Certificate on completion', desc: 'Issue certificate when course is completed', on: true },
            { label: 'Sequential lesson access', desc: 'Students must complete lessons in order', on: false },
            { label: 'Discussion enabled', desc: 'Enable lesson comments and Q&A', on: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <div className="text-sm font-medium text-stone-800">{setting.label}</div>
                <div className="text-xs text-stone-400 mt-0.5">{setting.desc}</div>
              </div>
              <button
                className={`w-10 h-5.5 rounded-full relative transition-all ${setting.on ? 'bg-indigo-600' : 'bg-stone-200'}`}
                style={{ width: 40, height: 22 }}
              >
                <span
                  className={`absolute top-0.5 rounded-full bg-white shadow transition-all`}
                  style={{ width: 18, height: 18, left: setting.on ? 20 : 2 }}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-rose-800 mb-1">Danger zone</h3>
          <p className="text-xs text-rose-600 mb-3">These actions cannot be undone.</p>
          <Btn variant="danger" size="sm">Archive course</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Preview Tab ──────────────────────────────────────────────────────────────

function PreviewTab({ course }: { course: Course }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-stone-100">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden border border-stone-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-5">
          <Badge variant="neutral" className="mb-2">{course.level}</Badge>
          <h2 className="text-white font-display text-lg font-semibold">{course.title}</h2>
          <p className="text-indigo-200 text-xs mt-1">{course.instructor.name}</p>
        </div>
        <div className="p-5">
          <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">{course.description}</p>
          <div className="flex gap-4 mt-4 text-xs text-stone-400 font-mono">
            <span>⭐ {course.rating}</span>
            <span>{course.totalLessons} lessons</span>
            <span>{formatDuration(course.totalDuration)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-stone-900">${course.price}</span>
            <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-medium">Enroll now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GripIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="9" r="1" fill="currentColor"/><circle cx="8" cy="9" r="1" fill="currentColor"/></svg>
}

function LessonTypeIcon({ type }: { type: 'video' | 'text' | 'quiz' }) {
  const cls = { video: 'text-sky-500', text: 'text-amber-500', quiz: 'text-violet-500' }[type]
  const icon = { video: '▶', text: '≡', quiz: '?' }[type]
  return <span className={`text-[10px] font-mono ${cls}`}>{icon}</span>
}
