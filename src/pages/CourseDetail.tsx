import { useState } from "react";
import { courses, studentEnrollments, formatDuration, getCourseById } from "@/lib/data";
import { Badge, Btn, ProgressBar, Avatar } from "@/components/ui";

interface Props {
  courseId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function CourseDetail({ courseId, onNavigate }: Props) {
  const course = getCourseById(courseId) ?? courses[0];
  const enrollment = studentEnrollments.find((e) => e.courseId === course.id);
  const [expandedModule, setExpandedModule] = useState<string | null>(
    course.modules[0]?.id ?? null,
  );
  const [enrolling, setEnrolling] = useState(false);

  const totalModules = course.modules.length;
  const previewLessons = course.modules.flatMap((m) => m.lessons).filter((l) => l.preview);

  function handleEnroll() {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      onNavigate("course-player", { courseId: course.id });
    }, 900);
  }

  const levelColor: Record<string, "success" | "warning" | "info"> = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "info",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-6">
        <button
          onClick={() => onNavigate("catalogue")}
          className="hover:text-stone-600 transition-colors"
        >
          Catalogue
        </button>
        <span>/</span>
        <span className="text-stone-400">{course.category}</span>
        <span>/</span>
        <span className="text-stone-700 font-medium truncate max-w-xs">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={levelColor[course.level] ?? "neutral"}>{course.level}</Badge>
              <Badge variant="neutral">{course.category}</Badge>
              {course.published ? (
                <Badge variant="success">Published</Badge>
              ) : (
                <Badge variant="warning">Draft</Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-semibold text-stone-900 leading-tight mb-3">
              {course.title}
            </h1>
            <p className="text-stone-600 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-stone-500">
              <span>
                ⭐ <strong className="text-stone-800">{course.rating}</strong> rating
              </span>
              <span>·</span>
              <span>
                <strong className="text-stone-800">{course.enrolled.toLocaleString()}</strong>{" "}
                students enrolled
              </span>
              <span>·</span>
              <span>
                <strong className="text-stone-800">{course.totalLessons}</strong> lessons
              </span>
              <span>·</span>
              <span>
                <strong className="text-stone-800">{formatDuration(course.totalDuration)}</strong>{" "}
                total
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Avatar name={course.instructor.name} size="sm" />
              <span className="text-sm text-stone-600">
                Instructor:{" "}
                <span className="font-medium text-stone-800">{course.instructor.name}</span>
              </span>
            </div>
          </div>

          {/* Cover image */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full h-56 object-cover bg-stone-100"
            />
            {previewLessons.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button className="flex items-center gap-2 bg-white text-stone-900 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-stone-50 transition-all shadow-lg">
                  <span className="text-indigo-600">▶</span> Preview course
                </button>
              </div>
            )}
          </div>

          {/* What you'll learn */}
          {course.outcomes.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                What you will learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-indigo-600 mt-0.5 shrink-0">✓</span>
                    <span className="text-sm text-stone-700">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          {course.modules.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-stone-900">Curriculum</h2>
                <div className="text-xs text-stone-400 font-mono">
                  {totalModules} modules · {course.totalLessons} lessons ·{" "}
                  {formatDuration(course.totalDuration)}
                </div>
              </div>
              <div className="space-y-2">
                {course.modules.map((mod) => {
                  const isOpen = expandedModule === mod.id;
                  const modDuration = mod.lessons.reduce((sum, l) => sum + l.duration, 0);
                  const completedCount = enrollment
                    ? mod.lessons.filter((l) => enrollment.completedLessons.includes(l.id)).length
                    : 0;

                  return (
                    <div
                      key={mod.id}
                      className="border border-stone-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-stone-50 transition-colors text-left"
                      >
                        <span className="font-mono text-xs text-stone-400 w-5">{mod.order}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-stone-800">{mod.title}</div>
                          <div className="text-xs text-stone-400 mt-0.5 font-mono">
                            {mod.lessons.length} lessons · {formatDuration(modDuration)}
                            {completedCount > 0 &&
                              ` · ${completedCount}/${mod.lessons.length} done`}
                          </div>
                        </div>
                        <span
                          className={`text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        >
                          ▾
                        </span>
                      </button>
                      {isOpen && (
                        <div className="divide-y divide-stone-100 border-t border-stone-100">
                          {mod.lessons.map((lesson) => {
                            const completed = enrollment?.completedLessons.includes(lesson.id);
                            const isCurrent = enrollment?.lastLessonId === lesson.id;
                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center gap-3 px-4 py-3 ${isCurrent ? "bg-indigo-50" : "bg-white"}`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    completed
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "border-stone-300"
                                  }`}
                                >
                                  {completed ? (
                                    <span className="text-[10px]">✓</span>
                                  ) : (
                                    <LessonTypeIcon type={lesson.type} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div
                                    className={`text-xs font-medium ${isCurrent ? "text-indigo-700" : "text-stone-700"}`}
                                  >
                                    {lesson.title}
                                    {isCurrent && (
                                      <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-mono">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono shrink-0">
                                  {lesson.preview && <Badge variant="info">Preview</Badge>}
                                  <span>{lesson.duration}m</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sticky purchase / progress card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden">
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-36 object-cover bg-stone-100"
              />
              <div className="p-5">
                {enrollment ? (
                  <EnrolledState enrollment={enrollment} course={course} onNavigate={onNavigate} />
                ) : (
                  <PurchaseState course={course} enrolling={enrolling} onEnroll={handleEnroll} />
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 bg-white border border-stone-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-stone-700 mb-3">This course includes</h3>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>📹 Video lessons</span>
                  <span className="font-mono">{course.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>⏱ Total duration</span>
                  <span className="font-mono">{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>📋 Modules</span>
                  <span className="font-mono">{course.modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>📜 Certificate</span>
                  <span className="font-mono text-emerald-600">Yes</span>
                </div>
                <div className="flex justify-between">
                  <span>♾ Access</span>
                  <span className="font-mono">Lifetime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrolledState({
  enrollment,
  course,
  onNavigate,
}: {
  enrollment: ReturnType<typeof studentEnrollments.find>;
  course: ReturnType<typeof getCourseById>;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  if (!enrollment || !course) return null;
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <Badge variant={enrollment.status === "completed" ? "success" : "default"}>
          {enrollment.status === "completed" ? "✓ Completed" : "In progress"}
        </Badge>
        <span className="text-sm font-bold font-mono text-stone-800">{enrollment.progress}%</span>
      </div>
      <ProgressBar value={enrollment.progress} size="md" showLabel={false} />
      {enrollment.lastLessonTitle && (
        <div className="text-xs text-stone-500 mt-2">
          Last: <span className="text-stone-700">{enrollment.lastLessonTitle}</span>
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <Btn
          className="w-full"
          onClick={() => onNavigate("course-player", { courseId: course.id })}
        >
          {enrollment.status === "completed" ? "Review course" : "▶ Continue learning"}
        </Btn>
      </div>
    </>
  );
}

function PurchaseState({
  course,
  enrolling,
  onEnroll,
}: {
  course: NonNullable<ReturnType<typeof getCourseById>>;
  enrolling: boolean;
  onEnroll: () => void;
}) {
  return (
    <>
      <div className="text-2xl font-bold font-display text-stone-900 mb-1">${course.price}</div>
      <div className="text-xs text-stone-400 mb-4">One-time · lifetime access</div>
      <Btn className="w-full mb-2" onClick={onEnroll} disabled={enrolling}>
        {enrolling ? "Enrolling…" : "Enroll now"}
      </Btn>
      <Btn variant="secondary" size="sm" className="w-full">
        Add to wishlist
      </Btn>
      <div className="mt-4 text-center text-xs text-stone-400">30-day money-back guarantee</div>
    </>
  );
}

function LessonTypeIcon({ type }: { type: "video" | "text" | "quiz" }) {
  if (type === "video") return <span className="text-[8px] text-stone-400">▶</span>;
  if (type === "text") return <span className="text-[8px] text-stone-400">≡</span>;
  return <span className="text-[8px] text-stone-400">?</span>;
}
