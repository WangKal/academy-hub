import { useState } from 'react'
import { courses, studentEnrollments, formatDuration, getCourseById } from '@/lib/data'
import { ProgressBar, Badge, Btn } from '@/components/ui'

interface Props {
  courseId: string
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function CoursePlayer({ courseId, onNavigate }: Props) {
  const course = getCourseById(courseId) ?? courses[0]
  const enrollment = studentEnrollments.find((e) => e.courseId === course.id)

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const [currentLessonId, setCurrentLessonId] = useState(
    enrollment?.lastLessonId ?? allLessons[0]?.id ?? ''
  )
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(enrollment?.completedLessons ?? [])
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentLesson = allLessons.find((l) => l.id === currentLessonId)
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const currentModule = course.modules.find((m) => m.lessons.some((l) => l.id === currentLessonId))

  const progress = allLessons.length > 0 ? Math.round((completed.size / allLessons.length) * 100) : 0

  function markComplete() {
    setCompleted((prev) => new Set([...prev, currentLessonId]))
    if (nextLesson) setCurrentLessonId(nextLesson.id)
  }

  const isCompleted = completed.has(currentLessonId)

  return (
    <div className="flex h-full overflow-hidden bg-stone-950">
      {/* Curriculum sidebar */}
      <div
        className={`shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-200 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 shrink-0">
          <button
            onClick={() => onNavigate('course-detail', { courseId: course.id })}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors"
          >
            <span>←</span> Back to course
          </button>
          <div className="text-sm font-semibold text-gray-100 leading-snug mb-2">{course.title}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">{progress}% complete</span>
            <span className="text-xs text-gray-500 font-mono">{completed.size}/{allLessons.length}</span>
          </div>
          <ProgressBar value={progress} size="xs" color="bg-indigo-500" />
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto py-2">
          {course.modules.map((mod) => {
            const modCompleted = mod.lessons.filter((l) => completed.has(l.id)).length
            return (
              <div key={mod.id} className="mb-1">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{mod.title}</span>
                  <span className="text-[10px] font-mono text-gray-600">{modCompleted}/{mod.lessons.length}</span>
                </div>
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId
                  const isDone = completed.has(lesson.id)
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonId(lesson.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                          : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                        isDone ? 'bg-emerald-500 border-emerald-500' : isActive ? 'border-indigo-400' : 'border-gray-600'
                      }`}>
                        {isDone && <span className="text-[8px] text-white">✓</span>}
                        {!isDone && isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs leading-snug ${isActive ? 'text-indigo-200 font-medium' : isDone ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                          {lesson.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <LessonTypePill type={lesson.type} />
                          <span className="text-[10px] text-gray-600 font-mono">{lesson.duration}m</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-600">{currentModule?.title}</span>
            <span className="text-gray-700">›</span>
            <span className="text-gray-300">{currentLesson?.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-600 font-mono">{progress}%</span>
            <ProgressBar value={progress} size="xs" color="bg-indigo-500" className="w-24" />
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson?.type === 'video' && <VideoLesson lesson={currentLesson} />}
          {currentLesson?.type === 'text' && <TextLesson lesson={currentLesson} course={course} />}
          {currentLesson?.type === 'quiz' && <QuizLesson lesson={currentLesson} />}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 flex items-center gap-3 shrink-0">
          <Btn
            variant="secondary"
            size="sm"
            disabled={!prevLesson}
            onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
            className="!bg-gray-800 !border-gray-700 !text-gray-300 hover:!bg-gray-700"
          >
            ← Previous
          </Btn>

          <div className="flex-1 text-center text-xs text-gray-600 font-mono">
            Lesson {currentIndex + 1} of {allLessons.length}
          </div>

          {!isCompleted ? (
            <Btn size="sm" onClick={markComplete}>
              Mark complete {nextLesson ? '& continue →' : ''}
            </Btn>
          ) : (
            <Btn
              size="sm"
              variant="secondary"
              disabled={!nextLesson}
              onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
              className="!bg-gray-800 !border-gray-700 !text-gray-300 hover:!bg-gray-700"
            >
              {nextLesson ? 'Next lesson →' : '🎉 Course complete!'}
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Lesson types ─────────────────────────────────────────────────────────────

function VideoLesson({ lesson }: { lesson: { title: string; duration: number } }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="flex flex-col items-center bg-black min-h-full">
      {/* Video frame */}
      <div className="w-full max-w-4xl">
        <div
          className="relative w-full bg-gray-900 cursor-pointer"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setPlaying(!playing)}
        >
          <img
            src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=1200&h=675&fit=crop&auto=format"
            alt="Video preview"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {!playing ? (
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                <span className="text-white text-2xl ml-1">▶</span>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                <span className="text-white text-lg">⏸</span>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-indigo-500 w-1/3 transition-all" />
          </div>
          {/* Duration */}
          <div className="absolute bottom-3 right-3 text-xs text-white/60 font-mono bg-black/50 px-1.5 py-0.5 rounded">
            {lesson.duration}:00
          </div>
        </div>

        {/* Lesson info */}
        <div className="px-6 py-6">
          <h2 className="text-white font-display text-xl font-semibold mb-2">{lesson.title}</h2>
          <div className="text-gray-400 text-sm">
            <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded mr-2">Video</span>
            {lesson.duration} minutes
          </div>
        </div>
      </div>
    </div>
  )
}

function TextLesson({ lesson, course }: { lesson: { title: string; duration: number }; course: ReturnType<typeof getCourseById> }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Badge variant="info" className="mb-4">Reading</Badge>
      <h2 className="font-display text-2xl font-semibold text-white mb-1">{lesson.title}</h2>
      <p className="text-gray-500 text-sm mb-8 font-mono">{lesson.duration} min read</p>
      <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
        <p>
          This lesson covers the core principles of the topic, with practical examples from production codebases.
          As you work through this material, consider how these patterns apply to your own projects.
        </p>
        <h3 className="text-gray-100 font-semibold text-base mt-6">Core concepts</h3>
        <p>
          The fundamental insight here is that composition is more powerful than inheritance in most UI scenarios.
          When you build components with clear, narrow interfaces, they become far easier to reason about, test, and reuse.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs text-emerald-400 my-4">
          <div className="text-gray-500 mb-2">// Example: compound component pattern</div>
          <div>{'const Form = { Root, Field, Label, Error, Submit }'}</div>
        </div>
        <p>
          This pattern is used extensively in modern design systems — Radix UI, shadcn/ui, and Headless UI all
          follow variants of this approach. By the end of this module, you will have the vocabulary and intuition
          to read and contribute to these libraries confidently.
        </p>
        <h3 className="text-gray-100 font-semibold text-base mt-6">Further reading</h3>
        <ul className="list-disc list-inside text-gray-400 space-y-1">
          <li>Kent C. Dodds — Compound Components</li>
          <li>React documentation — Thinking in React</li>
          <li>Patterns.dev — Design Patterns</li>
        </ul>
      </div>
    </div>
  )
}

function QuizLesson({ lesson }: { lesson: { title: string; duration: number } }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const questions = [
    {
      text: 'Which pattern allows components to share state implicitly through React Context?',
      options: ['Higher-Order Components', 'Compound Components', 'Render Props', 'Custom Hooks'],
      correct: 1,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="warning">Quiz</Badge>
        <span className="text-gray-500 text-xs font-mono">{lesson.duration} minutes</span>
      </div>
      <h2 className="font-display text-2xl font-semibold text-white mb-2">{lesson.title}</h2>
      <p className="text-gray-400 text-sm mb-8">Answer all questions. You need 70% to pass.</p>

      {questions.map((q, qi) => (
        <div key={qi} className="bg-gray-800 rounded-xl p-5 mb-4">
          <div className="text-xs font-mono text-gray-500 mb-2">Question {qi + 1} of {questions.length}</div>
          <p className="text-gray-100 text-sm font-medium mb-4">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isSelected = selected === oi
              const isCorrect = submitted && oi === q.correct
              const isWrong = submitted && isSelected && oi !== q.correct
              return (
                <button
                  key={oi}
                  onClick={() => !submitted && setSelected(oi)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    isCorrect ? 'bg-emerald-900/30 border-emerald-600 text-emerald-300' :
                    isWrong ? 'bg-rose-900/30 border-rose-600 text-rose-300' :
                    isSelected ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' :
                    'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                  }`}
                >
                  <span className="font-mono text-xs text-gray-500 mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <Btn disabled={selected === null} onClick={() => setSubmitted(true)} className="mt-2">
          Submit answers
        </Btn>
      ) : (
        <div className={`mt-4 p-4 rounded-xl border ${selected === questions[0].correct ? 'bg-emerald-900/20 border-emerald-700' : 'bg-rose-900/20 border-rose-700'}`}>
          <div className={`font-semibold text-sm ${selected === questions[0].correct ? 'text-emerald-400' : 'text-rose-400'}`}>
            {selected === questions[0].correct ? '✓ Correct! Well done.' : '✗ Incorrect. Review the lesson and try again.'}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function LessonTypePill({ type }: { type: 'video' | 'text' | 'quiz' }) {
  const cfg = {
    video: 'text-sky-400 bg-sky-900/30',
    text: 'text-amber-400 bg-amber-900/30',
    quiz: 'text-violet-400 bg-violet-900/30',
  }[type]
  return <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${cfg} capitalize`}>{type}</span>
}

function MenuIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
