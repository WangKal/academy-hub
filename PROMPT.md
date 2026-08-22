# Academy Hub — Enterprise LMS Rebuild Prompt

Use this document to recreate the full Academy Hub enterprise Learning Management System implementation from scratch.

---

## Project context

**Stack:** React 19 + Vite 8 + TypeScript 5.7 + Tailwind CSS v4 (via `@tailwindcss/vite`)

**Starting state:** A blank Vite/React scaffold (`src/App.tsx` contains only a dot-grid animation, `src/index.css` contains only `@import 'tailwindcss'`).

---

## What to build

Build a production-grade enterprise Learning Management System with three distinct user role experiences — Student, Instructor, and Administrator — sharing a single coherent design system.

The app is a fully interactive React SPA with client-side routing (no TanStack Router — use React state to manage the current page/view). All data comes from a centralized mock data module that simulates an API service layer. No direct database calls in UI components.

---

## Design system

### Aesthetic stance: Archival Enterprise

- **Ground:** Warm off-white content surfaces (`#FAFAF9`, `#FFFFFF`) against a cool dark navy sidebar (`#111827`)
- **Typography:**
  - Display/headings: **Fraunces** (optical-size serif from Google Fonts — unexpected, premium, educational gravitas)
  - UI/body: **Plus Jakarta Sans** (clean neo-grotesque)
  - Data/code/labels: **JetBrains Mono**
- **Primary accent:** Indigo (`#4F46E5`, `#6366F1`)
- **Semantic colors:** Emerald for success, Amber for warning, Rose for danger, Sky for info
- **Borders:** Warm stone (`#E7E5E4`)
- **No excessive shadows** — elevation through border contrast and background differentiation

### Font imports (place at top of `src/index.css` before all other statements)

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=JetBrains+Mono:wght@400;500&display=swap");
```

Add to `@theme inline`: `--font-display`, `--font-mono`, `--font-sans`. Add utility classes `.font-display`, `.font-mono` in global CSS.

### Tailwind v4 custom color tokens

Define a rich token set in `@theme inline` covering:

- `brand-50/100/200/500/600/700` (indigo spectrum)
- `surface`, `surface-2`, `surface-3` (content backgrounds)
- `ink-1/2/3/4` (text scale)
- `success/warning/danger/info` semantic families (50/100/600)
- `sidebar`, `sidebar-2`, `sidebar-3`, `sidebar-text`, `sidebar-active`

---

## File structure

```
src/
  index.css                    # Tailwind + Google Fonts + theme tokens + global styles
  App.tsx                      # Main router (React state, no library)
  lib/
    data.ts                    # All mock data + TypeScript types + helper functions
  components/
    ui.tsx                     # All shared UI primitives (single file)
    Shell.tsx                  # App shell: collapsible sidebar + topbar
  pages/
    StudentDashboard.tsx
    Catalogue.tsx
    CourseDetail.tsx
    CoursePlayer.tsx
    Certificates.tsx
    InstructorDashboard.tsx
    CourseBuilder.tsx
    AdminOverview.tsx
    AdminUsers.tsx
    AdminPayments.tsx
    AdminAuditLog.tsx
```

Additional pages (inline in `App.tsx`): MyCourses, NotificationsPage, ProfilePage, InstructorStudentsPage, InstructorAnalyticsPage, AdminCoursesPage, AdminEnrollmentsPage, AdminCertificatesPage, AdminOrganizationsPage, AdminSettingsPage, NotFoundPage.

---

## Data layer (`src/lib/data.ts`)

Export TypeScript interfaces: `Role`, `User`, `Lesson`, `Module`, `Course`, `Enrollment`, `Certificate`, `Notification`, `Payment`, `AuditLog`.

Export realistic mock data:

- `currentUsers: Record<Role, User>` — Sarah Chen (student), Marcus Rodriguez (instructor), Aisha Okonkwo (admin)
- `courses: Course[]` — 6 courses: Advanced React Patterns (4 modules, 15 lessons), Data Science Fundamentals, UX Design Mastery, Python for Enterprise, ML in Production, Cloud Architecture on AWS
- `studentEnrollments: Enrollment[]` — 3 enrollments with realistic progress, completedLessons arrays, quizScores
- `studentStats`, `certificates`, `notifications`, `instructorStats`, `instructorStudents`
- `adminStats`, `adminUsers: User[]` — 8 diverse users with different roles/statuses
- `adminPayments: Payment[]` — 6 payments covering all statuses (succeeded/pending/failed/refunded)
- `auditLogs: AuditLog[]` — 6 log entries with high/medium/low severity
- Helper functions: `getCourseById`, `getEnrollmentByCourse`, `formatDuration`, `formatCurrency`, `relativeTime`, `initials`

---

## UI primitives (`src/components/ui.tsx`)

Export the following components, all using Tailwind inline classes:

- **Avatar** — initials fallback with deterministic palette from name hash (6 color options); sizes: xs/sm/md/lg
- **Badge** — pill with ring-1 border; variants: default/success/warning/danger/info/neutral; uses `font-mono`
- **StatusDot** — small colored dot matching badge variants
- **ProgressBar** — thin rounded bar, sizes xs/sm/md, configurable color, optional label
- **MetricCard** — stat card with label/value/sub/trend/icon; hover border transition
- **EmptyState** — centered icon + title + body + optional action
- **Skeleton** + **CardSkeleton** — shimmer loading animation
- **PageHeader** — title + optional breadcrumb nav + optional description + optional actions slot
- **Btn** — 4 variants (primary/secondary/ghost/danger), 3 sizes (sm/md/lg)
- **Input** — with optional leading icon
- **Select** — styled native select
- **Card** — optional onClick with hover state
- **TabBar** — underline tabs with optional count badges
- **DataTable** — generic table with `Column<T>[]` config and optional `onRowClick`
- **ConfirmDialog** — modal overlay with confirm/cancel
- **BarChart** — pure CSS/SVG bar chart (no recharts dependency) using flex layout
- **RingProgress** — SVG ring/donut progress indicator

---

## App shell (`src/components/Shell.tsx`)

**Sidebar** (dark navy, `#111827`):

- Collapsible (256px ↔ 64px) with smooth CSS transition (`transition: width 0.22s cubic-bezier`)
- Academy Hub logo mark + wordmark
- Role switcher (3-button toggle: Learn/Teach/Admin) — switches `role` state in App
- Role-aware navigation items with SVG icons (16×16, stroke-based)
- Grouped admin nav (Platform / Operations / System sections)
- Active state: `bg-indigo-600/20 text-white` with left accent bar
- Collapsed: icon-only with tooltip via `title` attribute
- Footer: user avatar + name + role (hidden when collapsed)

**Topbar** (white, 56px):

- Global search input (placeholder, keyboard shortcut badge `⌘K`)
- Notification bell with unread dot badge; dropdown panel listing recent notifications
- Profile menu with avatar, name, role; dropdown with Profile/Settings/Help/Sign out

**Layout**: sidebar fixed left + flex-column main (topbar + scrolling content `<main>`)

**Navigation items per role:**

- Student: Dashboard, Course Catalogue, My Courses, Certificates, Notifications, Profile
- Instructor: Dashboard, Course Builder, Students, Analytics, Browse Catalogue, Profile
- Admin (grouped): Overview, Users, Courses, Organizations / Enrollments, Payments, Certificates, Audit Logs / Settings

---

## App router (`src/App.tsx`)

State: `role: Role`, `currentPage: string`, `params: RouteParams`

`navigate(page, params)` — sets page + params, scrolls `<main>` to top.

`handleRoleChange(role)` — changes role, resets to default page for that role (student→dashboard, instructor→instructor-dashboard, admin→admin-overview).

**Full-screen pages** (rendered without Shell): `course-player` — rendered directly with no sidebar/topbar.

**Shell pages**: everything else — wrapped in `<Shell>` with role/user/navigation props.

---

## Student Dashboard (`src/pages/StudentDashboard.tsx`)

"Learning Command Center" layout answering: what am I learning, where did I stop, what's next, how am I doing, what have I achieved.

- Dismissible streak/weekly-goal tip banner
- 4 MetricCards: Enrolled / Completed / Hours learned (with trend) / Certificates
- 3-column grid: left 2/3 = continue learning + in-progress list + completed list; right 1/3 = weekly goal ring + certificate preview + recommended courses + recent activity
- **ContinueLearningCard**: hero image with gradient overlay, module name, current lesson, progress bar, "Continue learning" button
- **CompactCourseRow**: thumbnail + title + last lesson + progress bar + relative timestamp
- **Weekly goal**: `RingProgress` ring with percentage + streak count
- Recommendations: 2 unenrolled courses with thumbnail + title + price

---

## Course Catalogue (`src/pages/Catalogue.tsx`)

- Filter bar: search input + category pill buttons (All/Engineering/Data Science/Design/AI&ML/Cloud) + level select + sort select + clear button
- Grid/List toggle (top right, 2 icon buttons in a pill container)
- Results count display
- **Grid view**: 3-column responsive card grid — `CourseCard` component with hover scale on image, level badge, enrollment progress bar overlay (if enrolled), rating/enrolled count, price or enrollment badge
- **List view**: `CourseListRow` — thumbnail + title + description snippet + instructor/rating/duration + progress bar
- Empty state with emoji and clear filters button

---

## Course Detail (`src/pages/CourseDetail.tsx`)

2-column layout (content 2/3 + sticky sidebar 1/3):

- Breadcrumb: Catalogue → Category → Course title
- Level/category/publish status badges
- Fraunces display heading
- Stats row: rating, enrolled count, lessons, duration
- Instructor avatar row
- Cover image with "Preview course" overlay button
- **Learning outcomes** in indigo-tinted 2-column grid with checkmarks
- **Curriculum accordion** — each module expandable, showing lessons with type icon, preview badge, duration, completion state (ring → checkmark), current lesson indicator
- **Sticky sidebar**: cover image + enrolled state (ProgressBar + continue button) OR purchase state (price + enroll button + wishlist + guarantee text)
- Includes panel below sidebar card with "this course includes" feature list

---

## Course Player (`src/pages/CoursePlayer.tsx`)

Full-screen dark layout (`bg-stone-950`) — no Shell chrome.

- **Left sidebar** (collapsible, 288px): dark gray (`gray-900`), course title + progress bar/count, module sections with lesson list
  - Each lesson: completion ring (filled green when done), active indicator (indigo dot), type pill (video/text/quiz in distinct colors), duration
  - Strikethrough on completed lessons
- **Top bar**: sidebar toggle + breadcrumb (module › lesson) + progress bar
- **Content area**: switches on `lesson.type`
  - **Video**: mock thumbnail + play/pause button overlay + bottom progress bar + duration badge
  - **Text**: prose content with styled code block example
  - **Quiz**: single question with A/B/C/D options, submit → reveal correct/incorrect with color coding
- **Bottom nav**: Previous / lesson counter / Mark complete (→ auto-advance) or Next lesson

State: `currentLessonId`, `completed: Set<string>`, `sidebarOpen`

---

## Instructor Dashboard (`src/pages/InstructorDashboard.tsx`)

- 4 MetricCards: Total enrollments (trend) / Active students / Avg completion / Avg quiz score
- Left 2/3: courses list table (thumbnail + title + enrolled + completion progress bar + publish badge + edit button) + monthly enrollment bar chart + quiz performance table with per-quiz progress bars
- Right 1/3: progress distribution (4 ranges with progress bars) + recent students list (avatar + name + org + enrolled count) + revenue summary (total + published/draft counts)

---

## Course Builder (`src/pages/CourseBuilder.tsx`)

Full-height layout with custom top bar (back button + editable title input + publish badge + Save draft + Publish buttons).

5 tabs: Overview / Curriculum / Quizzes / Settings / Preview

- **Overview tab**: form with title input, description textarea, category/level selects, price input, learning outcomes list with add/remove
- **Curriculum tab**: split layout — left 320px module tree + right lesson editor panel
  - Module tree: collapsible modules with grip icons (drag handle), lesson rows with type icon, duration; "Add lesson" button per module
  - Lesson editor: title input, type selector (3 buttons), video upload dropzone OR text textarea OR quiz builder, preview toggle, save/discard buttons
- **Quizzes tab**: list of quiz lessons with edit buttons, "+ New quiz" action
- **Settings tab**: toggle list (enrollment, certificates, sequential access, discussion) + danger zone (archive)
- **Preview tab**: centered course card preview in light gray background

---

## Admin Overview (`src/pages/AdminOverview.tsx`)

- 4 MetricCards: Total users (trend) / Enrollments / Revenue (trend) / Active users
- Alert banners: pending verifications + open support tickets (conditional, with action links)
- Left 2/3: revenue bar chart (monthly) + recent payments table + recent audit events table
- Right 1/3: platform health checklist (5 items with green/amber status dots) + quick actions panel (4 buttons)
- Both tables use `DataTable` with appropriate column configs

---

## Admin Users (`src/pages/AdminUsers.tsx`)

- Summary bar: Total / Active / Suspended / Pending / Instructors counts
- Filter bar: search input + role select + status select + clear button + result count
- `DataTable` with: user column (Avatar + name + email), role badge, organization, status badge, joined date, enrollment count, action buttons (appear on row hover via `opacity-0 group-hover:opacity-100`)
- Pagination placeholder (3 page buttons)
- **User detail slide-over panel** (fixed right, 384px): triggered on row click — identity block, detail grid, action buttons
- `ConfirmDialog` for suspend/delete actions

---

## Admin Payments (`src/pages/AdminPayments.tsx`)

- 4 MetricCards: Total revenue / Refunded / Pending count / Failed count
- Filter bar with search + status select + Export CSV button
- `DataTable` with: ID (mono), customer, course, amount (bold), status badge (with icon prefix), method (mono), date, contextual action buttons (Retry/Refund/Receipt on hover)

---

## Admin Audit Log (`src/pages/AdminAuditLog.tsx`)

- Severity filter buttons (High/Medium/Low pill buttons with badge + count, toggleable)
- Filter bar: search + severity select + event count
- `DataTable` with: timestamp (time + date in two lines), severity badge, actor (bold), action (monospace code chip), target, IP (muted)

---

## Architecture constraints

1. No direct data fetching in UI components — all data from `src/lib/data.ts` (the service boundary)
2. No external chart library — bars built with CSS flex/div elements
3. No TanStack Router — React `useState` manages current page
4. All TypeScript — no `any` except where unavoidable
5. Single CSS file approach — no CSS Modules, styled-components, or Emotion
6. Tailwind utility classes inline — no custom CSS classes except the few defined globally (`.font-display`, `.font-mono`, `.skeleton`, `.page-fade`, `.sidebar-enter`)
7. Course Player runs without Shell wrapper (full-screen dark learning environment)

---

## Key interaction details

- Role switcher in sidebar changes the experience instantly (no page reload feel)
- Sidebar collapses to icon-only mode with smooth width transition
- Notification dropdown + profile dropdown in topbar close on overlay click
- Course player: marking a lesson complete auto-advances to next; prev/next navigation; completed lessons show strikethrough + green ring
- Quiz submission reveals correct/incorrect feedback
- Admin confirm dialogs prevent accidental destructive actions
- All pages use `page-fade` animation class (CSS keyframe: opacity 0→1, translateY 4px→0)

---

## Realistic placeholder data

Use real-feeling names, organizations, and identifiers:

- Students: Sarah Chen (Meridian Technologies), Yuki Tanaka (Stratos Tech), Fatima Al-Rashid (Apex Industries), Natasha Volkov (DataPrime EU), Omar Hassan (TechCorp SA), Lena Bergström (Nordic Systems)
- Instructors: Marcus Rodriguez, Dr. Elena Vasquez, Jordan Park, Wei Zhang, Dr. Priya Sharma, Raj Patel
- Certificate codes: `AH-DS-2024-001847` format
- Payment IDs: `pay_001` format
- Audit log actions: `user.suspend`, `payment.failed`, `course.publish`, `certificate.issue`, `user.role_change`

---

## What this is NOT

- Not a prototype — the UI should feel production-ready
- Not a generic SaaS dashboard — the archival/educational visual language should be distinctive
- Not hardcoded data in components — all values flow from the data layer
- Not a form system — especially the Course Builder, which is a content workspace

---

## Phase 2: Public experience + dark mode

Extend the authenticated design system to a fully responsive public/unauthenticated experience with light and dark mode throughout.

### Dark mode system

- CSS custom properties on `:root` (light) and `.dark` (dark) for all semantic tokens: `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--ink-1`–`--ink-4`, `--edge`
- `@variant dark (&:where(.dark, .dark *))` in `src/index.css` for Tailwind v4 class-based dark mode
- `document.documentElement.classList.toggle('dark', darkMode)` in `App.tsx` `useEffect`
- Dark preference persisted in `localStorage` key `ah-dark`; falls back to `prefers-color-scheme: dark` on first visit
- All components use CSS var references (`var(--surface)`, `var(--ink-1)`, etc.) via inline `style` props or the semantic helper classes (`.bg-surface`, `.text-ink-1`, etc.) — not hardcoded Tailwind color tokens
- Shell topbar: uses `var(--surface)` + `var(--edge)` border; dark mode toggle button added to topbar right area
- Profile dropdown and notification panel: use CSS vars for background and border

### Public architecture

Two distinct layout shells:

1. **Authenticated**: `<Shell>` — dark navy left sidebar (256px/64px collapsed), topbar, role-aware nav
2. **Public**: `<PublicNav>` (fixed horizontal 64px) + page content + `<PublicFooter>`
3. **Auth pages** (login/register/forgot-password/verify): minimal chrome — back button + dark toggle only, no nav

`App.tsx` routing logic:

- `isAuthenticated: boolean` state (default `false`)
- `darkMode: boolean` state with `useEffect` + localStorage persistence
- `FULLSCREEN_PAGES`: `course-player` — no chrome at all
- `AUTH_PAGES`: `login`, `register`, `forgot-password`, `verify` — minimal chrome
- `PUBLIC_PAGES`: `home`, `catalogue`, `course-detail` — PublicNav + Footer
- When `!isAuthenticated`: show public layout; when authenticated: show Shell
- `handleSignIn(role?)` sets `isAuthenticated=true`, navigates to `defaultPages[role]`
- `handleSignOut()` sets `isAuthenticated=false`, navigates to `home`

### New components

**`src/components/PublicNav.tsx`**

- Fixed top horizontal nav, height 64px, `z-50`
- Left: Academy Hub logo (indigo square + wordmark)
- Center: nav links (Courses → catalogue, Features scroll, Instructors scroll)
- Right: dark mode toggle (moon/sun SVG), "Sign in" ghost button, "Get started" indigo primary button
- Mobile (`< md`): hamburger → slide-down drawer panel with all nav items
- All colors via CSS vars

**`src/components/PublicFooter.tsx`**

- 4-column link grid: Learn, Platform, Account, Support
- Brand logo + "Advancing enterprise learning." tagline
- Responsive: 1 col mobile → 5 col desktop (brand + 4 link groups)
- Copyright line + Terms/Privacy links

### New public pages

**`src/pages/public/HomePage.tsx`**

- Hero: indigo radial glow + subtle dot-grid background; animated eyebrow badge; Fraunces display heading with italic indigo span; search bar + category pills; CTA buttons
- Stats row: 8,400+ learners, 94 courses, 31,800+ enrollments, 4.7★ rating (realistic, not DB-derived)
- Course grid: 6 real courses from `courses` data with `CourseCard` components
- Featured course card: uses first `courses` entry; real data
- Features grid: 6 items with icons (Certificate, Progress tracking, etc.)
- "How it works" 4-step numbered flow
- Testimonials: 3 realistic quotes using student names from data
- Final CTA section: dual CTAs (Browse catalogue / Sign up free)
- All background/text colors via CSS vars for dark mode

**`src/pages/public/LoginPage.tsx`**

- Split layout: dark `bg-gray-900` left branding panel (desktop only) + form right
- Left: logo, quote testimonial, feature checklist
- Demo account shortcuts (Student / Instructor / Admin one-click `onSignIn`)
- Divider ("or sign in with email")
- Email + password fields; show/hide toggle on password; "Forgot password?" link
- Loading spinner state; field validation errors
- Role detection from email for demo routing

**`src/pages/public/RegisterPage.tsx`**

- Same split layout; left panel shows 2×2 stat grid (94 courses, 4.7★, 31K+ enrollments, 100% certs)
- Name / work email / password / role fields
- Password strength 4-bar indicator (rose → amber → emerald)
- Role picker cards: Learn (📚) / Teach (🎓) with icon, label, descriptor
- Post-submit: inline verification step (no page navigation) with email display and "Continue to Academy Hub" that calls `onSignIn(role)`

**`src/pages/public/ForgotPassword.tsx`**

- 5 states: `email` → `sent` → `reset` → `success` | `expired`
- Email step: form with email input + "Send reset link" button
- Sent step: confirmation with email displayed, two demo shortcuts (→ reset / → expired)
- Reset step: new password + confirm password with match validation
- Success step: green check, "Sign in →" CTA
- Expired step: amber clock, "Request a new link" button
- Loading spinners on all async-simulated actions

**`src/pages/public/VerificationPage.tsx`**

- 4 states: `pending` | `success` | `expired` | `invalid`
- Pending: 3-step checklist (check inbox → click link → return here), "Resend" button with spinner
- Success: green check, "Enter Academy Hub →" CTA that calls `onSignIn`
- Expired: red timer, "Send new verification link" button
- Invalid: red X, "Create a new account" / "Sign in" options
- Demo state switcher at bottom for previewing all states

### Responsive strategy

- All pages use `sm:`, `md:`, `lg:` breakpoints — not just shrinking desktop layouts
- Mobile-first: stack → row, 1-col grid → multi-col, full-width CTAs → inline
- PublicNav collapses to hamburger at `< md`
- Login/Register left panel hidden at `< lg` (`hidden lg:flex`)
- Course grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Shell sidebar: collapses to icon-only on narrow viewports (existing toggle)
