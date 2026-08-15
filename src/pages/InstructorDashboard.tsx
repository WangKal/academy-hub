import { courses, instructorStats, instructorStudents, formatDuration } from "@/lib/data";
import { PageHeader, MetricCard, Badge, Btn, Avatar, BarChart, ProgressBar } from "@/components/ui";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const myCourses = courses.slice(0, 4);

export default function InstructorDashboard({ onNavigate }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        title="Instructor Dashboard"
        description="Overview of your courses and student activity."
        actions={<Btn onClick={() => onNavigate("course-builder")}>+ New course</Btn>}
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total enrollments"
          value={instructorStats.totalEnrollments.toLocaleString()}
          sub="across all courses"
          trend={{ value: 8, label: "this month" }}
          icon={<UsersIcon />}
        />
        <MetricCard
          label="Active students"
          value={instructorStats.activeStudents.toLocaleString()}
          sub="learning right now"
          icon={<ActivityIcon />}
        />
        <MetricCard
          label="Avg completion"
          value={`${instructorStats.avgCompletionRate}%`}
          sub="across all courses"
          trend={{ value: 3, label: "vs last month" }}
          icon={<CheckIcon />}
        />
        <MetricCard
          label="Avg quiz score"
          value={`${instructorStats.avgQuizScore}%`}
          sub="student performance"
          icon={<StarIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: course list */}
        <div className="lg:col-span-2 space-y-5">
          {/* My courses */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-display text-base font-semibold text-stone-900">Your courses</h2>
              <Btn variant="ghost" size="sm" onClick={() => onNavigate("course-builder")}>
                Manage →
              </Btn>
            </div>
            <div className="divide-y divide-stone-100">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
                >
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-14 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 truncate">
                      {course.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-stone-400 font-mono">
                      <span>{course.enrolled.toLocaleString()} students</span>
                      <span>·</span>
                      <span>{course.completionRate}% completion</span>
                    </div>
                    <ProgressBar
                      value={course.completionRate}
                      size="xs"
                      className="mt-1.5 max-w-xs"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={course.published ? "success" : "warning"}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate("course-builder", { courseId: course.id })}
                    >
                      Edit
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment chart */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-base font-semibold text-stone-900">
                Monthly enrollments
              </h2>
              <span className="text-xs text-stone-400 font-mono">Last 7 months</span>
            </div>
            <BarChart
              data={instructorStats.monthlyEnrollments}
              valueKey="count"
              labelKey="month"
              color="#6366f1"
            />
          </div>

          {/* Quiz performance */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h2 className="font-display text-base font-semibold text-stone-900 mb-4">
              Quiz performance
            </h2>
            <div className="space-y-3">
              {instructorStats.quizPerformance.map((q) => (
                <div key={q.quiz} className="flex items-center gap-4">
                  <div className="text-xs text-stone-600 w-40 shrink-0 truncate">{q.quiz}</div>
                  <ProgressBar
                    value={q.avg}
                    size="sm"
                    color={
                      q.avg >= 80 ? "bg-emerald-500" : q.avg >= 70 ? "bg-amber-500" : "bg-rose-500"
                    }
                    showLabel
                  />
                  <span className="text-xs text-stone-400 font-mono w-20 shrink-0 text-right">
                    {q.attempts} attempts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: student activity */}
        <div className="space-y-5">
          {/* Progress distribution */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="font-display text-sm font-semibold text-stone-900 mb-4">
              Progress distribution
            </h3>
            <div className="space-y-3">
              {instructorStats.progressDistribution.map((d) => (
                <div key={d.range}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-600">{d.range}</span>
                    <span className="font-mono text-stone-500">{d.count} students</span>
                  </div>
                  <ProgressBar value={d.pct} size="sm" color="bg-indigo-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent students */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <h3 className="font-display text-sm font-semibold text-stone-900">Recent students</h3>
              <Btn variant="ghost" size="sm" onClick={() => onNavigate("instructor-students")}>
                View all →
              </Btn>
            </div>
            <div className="divide-y divide-stone-100">
              {instructorStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-stone-800 truncate">
                      {student.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {student.organization}
                    </div>
                  </div>
                  <Badge variant="neutral">{student.enrollments} courses</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue summary */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="font-display text-sm font-semibold text-stone-900 mb-3">Revenue</h3>
            <div className="text-2xl font-bold font-display text-stone-900 mb-1">
              ${instructorStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-stone-400 mb-4">Total lifetime earnings</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="text-stone-500">Published</div>
                <div className="font-semibold font-mono text-stone-800 mt-0.5">
                  {instructorStats.publishedCourses}
                </div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="text-stone-500">Drafts</div>
                <div className="font-semibold font-mono text-stone-800 mt-0.5">
                  {instructorStats.draftCourses}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 13c0-2.5 2-3.5 4.5-3.5s4.5 1 4.5 3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 4a2 2 0 1 1 0 4M12 9.5c2 0 3 1 3 3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline
        points="1,8 4,5 7,10 10,3 13,8 15,6"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
