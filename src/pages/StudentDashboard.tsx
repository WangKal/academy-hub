import { useState } from "react";
import {
  courses,
  studentEnrollments,
  studentStats,
  certificates,
  notifications,
  formatDuration,
  relativeTime,
  type Enrollment,
  type Course,
} from "@/lib/data";
import {
  PageHeader,
  Badge,
  ProgressBar,
  MetricCard,
  Avatar,
  RingProgress,
  Card,
  Btn,
} from "@/components/ui";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function StudentDashboard({ onNavigate }: Props) {
  const [dismissedTip, setDismissedTip] = useState(false);

  const inProgress = studentEnrollments.filter((e) => e.status === "in_progress");
  const completed = studentEnrollments.filter((e) => e.status === "completed");

  const primaryEnrollment = inProgress[0];
  const primaryCourse = primaryEnrollment
    ? courses.find((c) => c.id === primaryEnrollment.courseId)
    : null;

  const allModuleLessons = primaryCourse?.modules.flatMap((m) => m.lessons) ?? [];
  const nextLesson = primaryEnrollment
    ? allModuleLessons.find((l) => !primaryEnrollment.completedLessons.includes(l.id))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title={`Good morning, ${studentStats ? "Sarah" : "there"}.`}
        description="Here's where you are in your learning journey."
      />

      {/* Daily streak tip */}
      {!dismissedTip && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🔥</span>
          <div className="flex-1">
            <span className="text-sm font-medium text-indigo-800">
              {studentStats.currentStreak}-day streak — keep it going!
            </span>
            <span className="text-sm text-indigo-600 ml-2">
              You have {studentStats.weeklyGoal - studentStats.weeklyProgress} lesson
              {studentStats.weeklyGoal - studentStats.weeklyProgress !== 1 ? "s" : ""} left to hit
              your weekly goal.
            </span>
          </div>
          <button
            onClick={() => setDismissedTip(true)}
            className="text-indigo-400 hover:text-indigo-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Enrolled"
          value={studentStats.totalEnrolled}
          sub="active courses"
          icon={<CoursesIcon />}
        />
        <MetricCard
          label="Completed"
          value={studentStats.completed}
          sub="courses finished"
          icon={<CheckIcon />}
        />
        <MetricCard
          label="Hours learned"
          value={studentStats.hoursLearned}
          sub="total study time"
          trend={{ value: 12, label: "vs last month" }}
          icon={<ClockIcon />}
        />
        <MetricCard
          label="Certificates"
          value={studentStats.certificates}
          sub="earned so far"
          icon={<AwardIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue learning — primary card */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-stone-900 mb-3">
              Continue learning
            </h2>
            {primaryCourse && primaryEnrollment ? (
              <ContinueLearningCard
                course={primaryCourse}
                enrollment={primaryEnrollment}
                nextLesson={nextLesson?.title}
                onContinue={() => onNavigate("course-player", { courseId: primaryCourse.id })}
              />
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
                <p className="text-stone-500 text-sm mb-4">You have no courses in progress.</p>
                <Btn onClick={() => onNavigate("catalogue")}>Browse catalogue</Btn>
              </div>
            )}
          </div>

          {/* Other in-progress */}
          {inProgress.length > 1 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-3">
                Also in progress
              </h2>
              <div className="space-y-3">
                {inProgress.slice(1).map((enrollment) => {
                  const course = courses.find((c) => c.id === enrollment.courseId);
                  if (!course) return null;
                  return (
                    <CompactCourseRow
                      key={enrollment.courseId}
                      course={course}
                      enrollment={enrollment}
                      onClick={() => onNavigate("course-player", { courseId: course.id })}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-3">Completed</h2>
              <div className="space-y-3">
                {completed.map((enrollment) => {
                  const course = courses.find((c) => c.id === enrollment.courseId);
                  if (!course) return null;
                  return (
                    <div
                      key={enrollment.courseId}
                      className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4"
                    >
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-14 h-10 rounded-lg object-cover bg-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-800 truncate">
                          {course.title}
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          Completed{" "}
                          {enrollment.completedAt
                            ? new Date(enrollment.completedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""}
                        </div>
                      </div>
                      <Badge variant="success">✓ Complete</Badge>
                      {enrollment.certificateId && (
                        <Btn variant="ghost" size="sm" onClick={() => onNavigate("certificates")}>
                          Certificate →
                        </Btn>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Weekly goal */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-800">Weekly goal</h3>
              <span className="text-xs text-stone-400 font-mono">
                {studentStats.weeklyProgress}/{studentStats.weeklyGoal} lessons
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <RingProgress
                  value={(studentStats.weeklyProgress / studentStats.weeklyGoal) * 100}
                  size={64}
                  stroke={6}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-stone-700">
                  {Math.round((studentStats.weeklyProgress / studentStats.weeklyGoal) * 100)}%
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-stone-800">
                  {studentStats.weeklyProgress} done
                </div>
                <div className="text-xs text-stone-400">
                  {studentStats.weeklyGoal - studentStats.weeklyProgress} remaining
                </div>
                <div className="text-xs text-indigo-600 mt-1">
                  {studentStats.currentStreak} day streak 🔥
                </div>
              </div>
            </div>
          </Card>

          {/* Latest certificate */}
          {certificates.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-stone-800 mb-3">Latest certificate</h3>
              {certificates.slice(0, 1).map((cert) => (
                <div key={cert.id}>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold text-indigo-800 mb-0.5">
                      {cert.courseTitle}
                    </div>
                    <div className="text-[10px] text-indigo-500 font-mono">{cert.code}</div>
                    <div className="text-[10px] text-indigo-400 mt-1">
                      Issued{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <Btn
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => onNavigate("certificates")}
                  >
                    View all certificates
                  </Btn>
                </div>
              ))}
            </Card>
          )}

          {/* Recommended */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Recommended for you</h3>
            <div className="space-y-3">
              {courses
                .filter((c) => !studentEnrollments.find((e) => e.courseId === c.id))
                .slice(0, 2)
                .map((course) => (
                  <button
                    key={course.id}
                    onClick={() => onNavigate("course-detail", { courseId: course.id })}
                    className="w-full text-left flex items-center gap-3 group"
                  >
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-stone-800 group-hover:text-indigo-700 transition-colors line-clamp-2">
                        {course.title}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {course.instructor.name} · ${course.price}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
            <Btn
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={() => onNavigate("catalogue")}
            >
              Browse all →
            </Btn>
          </Card>

          {/* Recent notifications */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Recent activity</h3>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="flex gap-2.5 items-start">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-indigo-500" : "bg-stone-300"}`}
                  />
                  <div>
                    <div className="text-xs font-medium text-stone-700">{n.title}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Continue Learning Card ────────────────────────────────────────────────────

function ContinueLearningCard({
  course,
  enrollment,
  nextLesson,
  onContinue,
}: {
  course: Course;
  enrollment: Enrollment;
  nextLesson?: string;
  onContinue: () => void;
}) {
  const currentModule = course.modules.find((m) =>
    m.lessons.some((l) => l.id === enrollment.lastLessonId),
  );
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all">
      <div className="relative">
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-36 object-cover bg-stone-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <Badge variant="default">In Progress</Badge>
          <h3 className="text-white font-semibold text-base mt-1 leading-tight">{course.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-stone-500">Current module</div>
            <div className="text-sm font-medium text-stone-800">
              {currentModule?.title ?? "Getting started"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-500">Progress</div>
            <div className="text-sm font-bold font-mono text-stone-800">{enrollment.progress}%</div>
          </div>
        </div>
        <ProgressBar value={enrollment.progress} showLabel={false} size="md" />
        {enrollment.lastLessonTitle && (
          <div className="mt-3 text-xs text-stone-400">
            Last: <span className="text-stone-600">{enrollment.lastLessonTitle}</span>
          </div>
        )}
        {nextLesson && (
          <div className="mt-1 text-xs text-stone-400">
            Up next: <span className="text-indigo-600 font-medium">{nextLesson}</span>
          </div>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Btn onClick={onContinue} className="flex-1">
            <PlayIcon /> Continue learning
          </Btn>
          <div className="text-xs text-stone-400 font-mono">
            {enrollment.completedLessons.length}/{course.totalLessons} lessons
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compact Course Row ───────────────────────────────────────────────────────

function CompactCourseRow({
  course,
  enrollment,
  onClick,
}: {
  course: Course;
  enrollment: Enrollment;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 hover:border-stone-300 hover:shadow-sm transition-all"
    >
      <img
        src={course.coverImage}
        alt={course.title}
        className="w-12 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-stone-800 truncate">{course.title}</div>
        {enrollment.lastLessonTitle && (
          <div className="text-xs text-stone-400 mt-0.5 truncate">
            Last: {enrollment.lastLessonTitle}
          </div>
        )}
        <ProgressBar value={enrollment.progress} size="xs" className="mt-1.5" />
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold font-mono text-stone-700">{enrollment.progress}%</div>
        <div className="text-xs text-stone-400">{relativeTime(enrollment.lastAccessedAt)}</div>
      </div>
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 2l9 5-9 5V2Z" fill="currentColor" />
    </svg>
  );
}
function CoursesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="5" y1="3" x2="5" y2="13" stroke="currentColor" strokeWidth="1.3" />
      <line x1="8" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.3" />
      <line x1="8" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.5 8l2 2 3-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function AwardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.5 9.5 4 14l4-2 4 2-1.5-4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
