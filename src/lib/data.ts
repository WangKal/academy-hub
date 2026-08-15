// Simulates data returned by the service/API layer.
// In production, these shapes come from src/services/api.ts → Python API → PostgreSQL.

export type Role = "student" | "instructor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  joinedAt: string;
  status: "active" | "suspended" | "pending";
  avatar?: string;
  enrollments?: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  duration: number;
  preview?: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructor: { id: string; name: string };
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  coverImage: string;
  description: string;
  outcomes: string[];
  modules: Module[];
  totalLessons: number;
  totalDuration: number;
  enrolled: number;
  rating: number;
  published: boolean;
  completionRate: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  lastAccessedAt: string;
  lastLessonId: string | null;
  lastLessonTitle?: string;
  completedLessons: string[];
  quizScores: Record<string, number>;
  status: "in_progress" | "completed" | "paused";
  certificateId?: string;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  issuedAt: string;
  code: string;
  status: "active" | "revoked";
  instructorName: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  category: "learning" | "achievement" | "admin" | "system";
}

export interface Payment {
  id: string;
  user: string;
  course: string;
  amount: number;
  status: "succeeded" | "pending" | "failed" | "refunded";
  date: string;
  method: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

// ─── Users ──────────────────────────────────────────────────────────────────

export const currentUsers: Record<Role, User> = {
  student: {
    id: "usr_001",
    name: "Sarah Chen",
    email: "sarah.chen@meridiantech.com",
    role: "student",
    organization: "Meridian Technologies",
    joinedAt: "2024-01-15",
    status: "active",
  },
  instructor: {
    id: "usr_002",
    name: "Marcus Rodriguez",
    email: "m.rodriguez@academyhub.io",
    role: "instructor",
    organization: "Academy Hub",
    joinedAt: "2023-06-20",
    status: "active",
  },
  admin: {
    id: "usr_003",
    name: "Aisha Okonkwo",
    email: "a.okonkwo@academyhub.io",
    role: "admin",
    organization: "Academy Hub",
    joinedAt: "2022-11-01",
    status: "active",
  },
};

// ─── Courses ─────────────────────────────────────────────────────────────────

export const courses: Course[] = [
  {
    id: "crs_001",
    title: "Advanced React Patterns & Architecture",
    slug: "advanced-react-patterns",
    instructor: { id: "usr_002", name: "Marcus Rodriguez" },
    category: "Engineering",
    level: "Advanced",
    price: 189,
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop&auto=format",
    description:
      "Master compound components, render props, custom hooks, state machines, and performance optimization in production React applications. Built for engineers who already know React and want to architect systems that scale.",
    outcomes: [
      "Build flexible, composable component libraries using compound components",
      "Implement advanced state management with XState and Zustand",
      "Profile and optimize rendering performance in large applications",
      "Architect monorepo React applications with shared design systems",
    ],
    modules: [
      {
        id: "mod_001",
        title: "Foundations & Mental Models",
        order: 1,
        lessons: [
          {
            id: "les_001",
            title: "Component Composition Philosophy",
            type: "video",
            duration: 28,
            preview: true,
          },
          { id: "les_002", title: "React's Reconciliation Algorithm", type: "video", duration: 34 },
          { id: "les_003", title: "Module 1 Knowledge Check", type: "quiz", duration: 10 },
        ],
      },
      {
        id: "mod_002",
        title: "Advanced Component Patterns",
        order: 2,
        lessons: [
          { id: "les_004", title: "Compound Components In Depth", type: "video", duration: 42 },
          { id: "les_005", title: "Render Props & HOC Patterns", type: "video", duration: 38 },
          { id: "les_006", title: "Custom Hook Architecture", type: "video", duration: 45 },
          { id: "les_007", title: "Hands-on: Build a Design System", type: "text", duration: 20 },
          { id: "les_008", title: "Module 2 Assessment", type: "quiz", duration: 15 },
        ],
      },
      {
        id: "mod_003",
        title: "State & Data Patterns",
        order: 3,
        lessons: [
          { id: "les_009", title: "State Machines with XState", type: "video", duration: 51 },
          { id: "les_010", title: "Server State vs Client State", type: "video", duration: 33 },
          { id: "les_011", title: "Optimistic UI Patterns", type: "text", duration: 15 },
        ],
      },
      {
        id: "mod_004",
        title: "Performance & Production",
        order: 4,
        lessons: [
          { id: "les_012", title: "Profiling & Bottleneck Analysis", type: "video", duration: 40 },
          { id: "les_013", title: "Code Splitting Strategies", type: "video", duration: 28 },
          { id: "les_014", title: "Production Deployment Patterns", type: "video", duration: 35 },
          { id: "les_015", title: "Final Assessment", type: "quiz", duration: 25 },
        ],
      },
    ],
    totalLessons: 15,
    totalDuration: 459,
    enrolled: 847,
    rating: 4.8,
    published: true,
    completionRate: 72,
  },
  {
    id: "crs_002",
    title: "Data Science Fundamentals",
    slug: "data-science-fundamentals",
    instructor: { id: "usr_010", name: "Dr. Elena Vasquez" },
    category: "Data Science",
    level: "Beginner",
    price: 129,
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format",
    description:
      "A comprehensive introduction to data science: Python, pandas, NumPy, visualization, and statistical fundamentals for working professionals with no prior background.",
    outcomes: [
      "Manipulate real datasets with pandas and NumPy",
      "Create publication-quality visualizations with matplotlib and seaborn",
      "Apply core statistical methods and hypothesis testing",
      "Build your first predictive models with scikit-learn",
    ],
    modules: [],
    totalLessons: 22,
    totalDuration: 680,
    enrolled: 2341,
    rating: 4.6,
    published: true,
    completionRate: 58,
  },
  {
    id: "crs_003",
    title: "UX Design Mastery",
    slug: "ux-design-mastery",
    instructor: { id: "usr_011", name: "Jordan Park" },
    category: "Design",
    level: "Intermediate",
    price: 159,
    coverImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop&auto=format",
    description:
      "From user research to high-fidelity prototypes — learn the full UX design process used at top product companies, including Google, Airbnb, and Figma.",
    outcomes: [],
    modules: [],
    totalLessons: 18,
    totalDuration: 520,
    enrolled: 1205,
    rating: 4.9,
    published: true,
    completionRate: 65,
  },
  {
    id: "crs_004",
    title: "Python for Enterprise",
    slug: "python-enterprise",
    instructor: { id: "usr_012", name: "Wei Zhang" },
    category: "Engineering",
    level: "Intermediate",
    price: 149,
    coverImage:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop&auto=format",
    description:
      "Python architecture for enterprise applications: async programming, testing, packaging, CI/CD, and maintainability at scale.",
    outcomes: [],
    modules: [],
    totalLessons: 20,
    totalDuration: 610,
    enrolled: 934,
    rating: 4.7,
    published: true,
    completionRate: 61,
  },
  {
    id: "crs_005",
    title: "Machine Learning in Production",
    slug: "ml-production",
    instructor: { id: "usr_013", name: "Dr. Priya Sharma" },
    category: "AI & ML",
    level: "Advanced",
    price: 219,
    coverImage:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop&auto=format",
    description:
      "Deploy, monitor, and maintain ML models in production using MLOps best practices: feature stores, model registries, drift detection, and automated retraining.",
    outcomes: [],
    modules: [],
    totalLessons: 24,
    totalDuration: 720,
    enrolled: 612,
    rating: 4.7,
    published: false,
    completionRate: 45,
  },
  {
    id: "crs_006",
    title: "Cloud Architecture on AWS",
    slug: "aws-cloud-architecture",
    instructor: { id: "usr_014", name: "Raj Patel" },
    category: "Cloud",
    level: "Intermediate",
    price: 199,
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&auto=format",
    description:
      "Design resilient, scalable, cost-optimized AWS architectures. Covers VPC, EC2, Lambda, RDS, S3, CloudFront, and exam prep for Solutions Architect Associate.",
    outcomes: [],
    modules: [],
    totalLessons: 26,
    totalDuration: 780,
    enrolled: 1847,
    rating: 4.5,
    published: true,
    completionRate: 54,
  },
];

// ─── Student ─────────────────────────────────────────────────────────────────

export const studentEnrollments: Enrollment[] = [
  {
    id: "enr_001",
    courseId: "crs_001",
    enrolledAt: "2024-02-01",
    progress: 67,
    lastAccessedAt: "2024-03-14",
    lastLessonId: "les_009",
    lastLessonTitle: "State Machines with XState",
    completedLessons: [
      "les_001",
      "les_002",
      "les_003",
      "les_004",
      "les_005",
      "les_006",
      "les_007",
      "les_008",
      "les_009",
      "les_010",
    ],
    quizScores: { les_003: 92, les_008: 85 },
    status: "in_progress",
  },
  {
    id: "enr_002",
    courseId: "crs_002",
    enrolledAt: "2023-11-15",
    progress: 100,
    lastAccessedAt: "2024-01-20",
    lastLessonId: null,
    completedLessons: [],
    quizScores: {},
    status: "completed",
    certificateId: "cert_001",
    completedAt: "2024-01-20",
  },
  {
    id: "enr_003",
    courseId: "crs_003",
    enrolledAt: "2024-03-01",
    progress: 22,
    lastAccessedAt: "2024-03-10",
    lastLessonId: "les_004",
    lastLessonTitle: "Research Synthesis Methods",
    completedLessons: [],
    quizScores: {},
    status: "in_progress",
  },
];

export const studentStats = {
  totalEnrolled: 3,
  completed: 1,
  certificates: 1,
  hoursLearned: 47,
  currentStreak: 5,
  weeklyGoal: 4,
  weeklyProgress: 3,
};

export const certificates: Certificate[] = [
  {
    id: "cert_001",
    courseId: "crs_002",
    courseTitle: "Data Science Fundamentals",
    studentId: "usr_001",
    studentName: "Sarah Chen",
    issuedAt: "2024-01-20",
    code: "AH-DS-2024-001847",
    status: "active",
    instructorName: "Dr. Elena Vasquez",
  },
];

export const notifications: Notification[] = [
  {
    id: "notif_001",
    type: "lesson_unlocked",
    title: "New lesson available",
    body: '"Production Deployment Patterns" is now available in Advanced React Patterns & Architecture.',
    read: false,
    createdAt: "2024-03-14T10:23:00Z",
    category: "learning",
  },
  {
    id: "notif_002",
    type: "quiz_result",
    title: "Quiz result: Module 2 Assessment",
    body: "You scored 85% — great work! You can review your answers any time.",
    read: false,
    createdAt: "2024-03-13T14:05:00Z",
    category: "learning",
  },
  {
    id: "notif_003",
    type: "certificate_issued",
    title: "Certificate earned",
    body: "Your certificate for Data Science Fundamentals is ready to download.",
    read: true,
    createdAt: "2024-01-20T09:00:00Z",
    category: "achievement",
  },
  {
    id: "notif_004",
    type: "course_update",
    title: "Course updated: UX Design Mastery",
    body: "3 new lessons have been added to Module 2: Research & Discovery.",
    read: true,
    createdAt: "2024-03-05T08:00:00Z",
    category: "learning",
  },
];

// ─── Instructor ───────────────────────────────────────────────────────────────

export const instructorStats = {
  totalCourses: 4,
  publishedCourses: 3,
  draftCourses: 1,
  totalEnrollments: 2847,
  activeStudents: 1203,
  completedStudents: 847,
  avgCompletionRate: 68,
  avgQuizScore: 81,
  totalRevenue: 312840,
  monthlyEnrollments: [
    { month: "Sep", count: 180 },
    { month: "Oct", count: 220 },
    { month: "Nov", count: 195 },
    { month: "Dec", count: 140 },
    { month: "Jan", count: 260 },
    { month: "Feb", count: 310 },
    { month: "Mar", count: 290 },
  ],
  progressDistribution: [
    { range: "0–25%", count: 312, pct: 27 },
    { range: "26–50%", count: 445, pct: 39 },
    { range: "51–75%", count: 289, pct: 25 },
    { range: "76–100%", count: 357, pct: 31 },
  ],
  quizPerformance: [
    { quiz: "Mod 1 Check", avg: 88, attempts: 847 },
    { quiz: "Mod 2 Assessment", avg: 81, attempts: 712 },
    { quiz: "Final Assessment", avg: 76, attempts: 398 },
  ],
};

export const instructorStudents: User[] = [
  {
    id: "usr_001",
    name: "Sarah Chen",
    email: "sarah.chen@meridiantech.com",
    role: "student",
    organization: "Meridian Technologies",
    joinedAt: "2024-02-01",
    status: "active",
    enrollments: 3,
  },
  {
    id: "usr_004",
    name: "Yuki Tanaka",
    email: "y.tanaka@stratostech.com",
    role: "student",
    organization: "Stratos Tech",
    joinedAt: "2024-01-08",
    status: "active",
    enrollments: 5,
  },
  {
    id: "usr_007",
    name: "Natasha Volkov",
    email: "n.volkov@dataprime.eu",
    role: "student",
    organization: "DataPrime EU",
    joinedAt: "2024-01-30",
    status: "active",
    enrollments: 4,
  },
  {
    id: "usr_008",
    name: "Omar Hassan",
    email: "o.hassan@techcorp.sa",
    role: "student",
    organization: "TechCorp SA",
    joinedAt: "2023-11-05",
    status: "active",
    enrollments: 7,
  },
];

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminStats = {
  totalUsers: 8472,
  totalCourses: 94,
  totalEnrollments: 31840,
  totalRevenue: 2847320,
  activeUsers: 3421,
  newUsersThisMonth: 847,
  pendingVerifications: 12,
  openSupportTickets: 7,
  revenueByMonth: [
    { month: "Sep", amount: 180400 },
    { month: "Oct", amount: 210800 },
    { month: "Nov", amount: 195600 },
    { month: "Dec", amount: 168200 },
    { month: "Jan", amount: 252000 },
    { month: "Feb", amount: 318400 },
    { month: "Mar", amount: 295200 },
  ],
};

export const adminUsers: User[] = [
  {
    id: "usr_001",
    name: "Sarah Chen",
    email: "sarah.chen@meridiantech.com",
    role: "student",
    organization: "Meridian Technologies",
    joinedAt: "2024-01-15",
    status: "active",
    enrollments: 3,
  },
  {
    id: "usr_002",
    name: "Marcus Rodriguez",
    email: "m.rodriguez@academyhub.io",
    role: "instructor",
    organization: "Academy Hub",
    joinedAt: "2023-06-20",
    status: "active",
    enrollments: 0,
  },
  {
    id: "usr_004",
    name: "Yuki Tanaka",
    email: "y.tanaka@stratostech.com",
    role: "student",
    organization: "Stratos Tech",
    joinedAt: "2023-12-08",
    status: "active",
    enrollments: 5,
  },
  {
    id: "usr_005",
    name: "Fatima Al-Rashid",
    email: "f.alrashid@apex.io",
    role: "student",
    organization: "Apex Industries",
    joinedAt: "2024-02-22",
    status: "suspended",
    enrollments: 2,
  },
  {
    id: "usr_006",
    name: "Kwame Asante",
    email: "k.asante@globallearn.org",
    role: "instructor",
    organization: "GlobalLearn",
    joinedAt: "2023-09-14",
    status: "active",
    enrollments: 0,
  },
  {
    id: "usr_007",
    name: "Natasha Volkov",
    email: "n.volkov@dataprime.eu",
    role: "student",
    organization: "DataPrime EU",
    joinedAt: "2024-01-30",
    status: "active",
    enrollments: 4,
  },
  {
    id: "usr_008",
    name: "Omar Hassan",
    email: "o.hassan@techcorp.sa",
    role: "student",
    organization: "TechCorp SA",
    joinedAt: "2023-11-05",
    status: "active",
    enrollments: 7,
  },
  {
    id: "usr_009",
    name: "Lena Bergström",
    email: "l.bergstrom@nordic.se",
    role: "student",
    organization: "Nordic Systems",
    joinedAt: "2024-03-01",
    status: "pending",
    enrollments: 1,
  },
];

export const adminPayments: Payment[] = [
  {
    id: "pay_001",
    user: "Sarah Chen",
    course: "Advanced React Patterns",
    amount: 189,
    status: "succeeded",
    date: "2024-02-01",
    method: "Visa •••• 4242",
  },
  {
    id: "pay_002",
    user: "Yuki Tanaka",
    course: "Machine Learning in Production",
    amount: 219,
    status: "succeeded",
    date: "2024-02-15",
    method: "Mastercard •••• 8823",
  },
  {
    id: "pay_003",
    user: "Fatima Al-Rashid",
    course: "UX Design Mastery",
    amount: 159,
    status: "refunded",
    date: "2024-02-22",
    method: "Visa •••• 1199",
  },
  {
    id: "pay_004",
    user: "Omar Hassan",
    course: "Python for Enterprise",
    amount: 149,
    status: "succeeded",
    date: "2024-03-05",
    method: "Stripe",
  },
  {
    id: "pay_005",
    user: "Natasha Volkov",
    course: "Data Science Fundamentals",
    amount: 129,
    status: "failed",
    date: "2024-03-08",
    method: "Visa •••• 7731",
  },
  {
    id: "pay_006",
    user: "Lena Bergström",
    course: "Advanced React Patterns",
    amount: 189,
    status: "pending",
    date: "2024-03-12",
    method: "Bank Transfer",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "log_001",
    actor: "Aisha Okonkwo",
    action: "user.suspend",
    target: "Fatima Al-Rashid",
    ip: "192.168.1.42",
    timestamp: "2024-03-14T09:31:00Z",
    severity: "high",
  },
  {
    id: "log_002",
    actor: "System",
    action: "payment.failed",
    target: "pay_005 — Natasha Volkov",
    ip: "—",
    timestamp: "2024-03-08T14:22:00Z",
    severity: "medium",
  },
  {
    id: "log_003",
    actor: "Marcus Rodriguez",
    action: "course.publish",
    target: "Advanced React Patterns & Architecture",
    ip: "203.0.113.5",
    timestamp: "2024-03-07T11:15:00Z",
    severity: "low",
  },
  {
    id: "log_004",
    actor: "System",
    action: "certificate.issue",
    target: "cert_001 — Sarah Chen",
    ip: "—",
    timestamp: "2024-01-20T09:00:00Z",
    severity: "low",
  },
  {
    id: "log_005",
    actor: "Aisha Okonkwo",
    action: "user.role_change",
    target: "Kwame Asante → instructor",
    ip: "192.168.1.42",
    timestamp: "2023-09-14T16:45:00Z",
    severity: "high",
  },
  {
    id: "log_006",
    actor: "System",
    action: "user.verification_sent",
    target: "Lena Bergström",
    ip: "—",
    timestamp: "2024-03-01T08:12:00Z",
    severity: "low",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getEnrollmentByCourse(courseId: string): Enrollment | undefined {
  return studentEnrollments.find((e) => e.courseId === courseId);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
