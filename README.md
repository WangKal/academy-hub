# Academy Hub

# ENTERPRISE LMS — LOVABLE IMPLEMENTATION PROMPT

Build a production-quality, enterprise-ready Learning Management System for an **Executive & Personal Assistant Academy**.

The application must be designed so that the current Lovable/Supabase implementation can later be migrated to a **Python backend** without requiring a rewrite of the React frontend.

This is extremely important.

## 1. ARCHITECTURAL PRINCIPLE

Build the application using:

* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase initially for authentication, database and storage
* A centralized frontend API/service abstraction

### CRITICAL RULE

**React components must NEVER directly call Supabase.**

Do not put:

* Supabase queries
* Supabase mutations
* authentication calls
* database calls
* storage calls
* payment calls
* business logic

inside pages or UI components.

Instead, create one centralized service file:

`src/services/api.ts`

This file will temporarily contain **ALL backend/data function calls**.

The frontend must communicate with the application through functions exported from this file.

For example:

```ts
getCurrentUser()
login()
logout()
getCourses()
getCourse()
createCourse()
updateCourse()
getModules()
createModule()
getLessons()
createLesson()
enrollInCourse()
getEnrollment()
getLessonProgress()
updateLessonProgress()
submitQuiz()
getQuizAttempts()
getCertificates()
createPayment()
getDashboardStats()
```

The exact function set should cover the complete application.

Later, the contents of `api.ts` will be replaced with HTTP requests to a Python backend.

The React pages/components should continue working without modification.

---

# 2. BACKEND MIGRATION CONTRACT

Treat `src/services/api.ts` as an abstraction boundary.

Every function must:

1. Accept explicit typed parameters.
2. Return predictable typed objects.
3. Handle errors consistently.
4. Never expose Supabase-specific objects to UI components.
5. Never return raw Supabase responses.
6. Transform database responses into application/domain objects.
7. Keep database implementation details inside `api.ts`.

Example:

```ts
export async function getCourses(filters?: CourseFilters): Promise<Course[]> {
    // temporary Supabase implementation
}
```

The component should only know:

```ts
const courses = await getCourses(filters);
```

It must NOT know whether the data came from:

* Supabase
* REST
* Django
* FastAPI
* another Python service
* a mock backend

This abstraction is mandatory.

---

# 3. DO NOT BUILD A THROWAWAY DEMO

Build this as the first version of a real product.

The application must have:

* proper loading states
* error handling
* empty states
* confirmation dialogs
* form validation
* pagination where appropriate
* search
* filtering
* sorting
* responsive design
* role-based navigation
* protected routes
* reusable components
* reusable forms
* reusable tables
* reusable dialogs
* reusable API/service functions

Do not hardcode application data inside components except for UI constants.

Seed/sample data may be provided for demonstration.

---

# 4. ENTERPRISE ARCHITECTURE

Design the system around these logical layers:

```text
React UI
   ↓
Hooks / Page Logic
   ↓
src/services/api.ts
   ↓
Supabase (initial implementation)
```

Later:

```text
React UI
   ↓
Hooks / Page Logic
   ↓
src/services/api.ts
   ↓
Python API
   ↓
PostgreSQL
```

The frontend should therefore be completely unaware of the eventual Python implementation.

---

# 5. USER ROLES

Implement three primary roles:

### Student

Can:

* browse published courses
* view course details
* enroll
* purchase courses
* access enrolled courses
* watch lessons
* read lesson content
* track progress
* take quizzes
* view quiz results
* retry quizzes
* complete courses
* view certificates
* download certificates
* manage profile

### Instructor

Can:

* create courses
* edit courses
* create modules
* reorder modules
* create lessons
* reorder lessons
* upload/select lesson media
* create quizzes
* create questions
* create options
* define correct answers
* configure passing score
* publish/unpublish courses where permitted
* view enrolled students
* view course progress
* view quiz performance
* view course statistics

Instructors must only manage content they are authorized to manage.

### Administrator

Can:

* manage users
* manage roles
* manage instructors
* manage students
* manage courses
* publish/unpublish courses
* manage enrollments
* manage payments
* manage certificates
* revoke certificates
* reissue certificates
* view system statistics
* manage academy settings
* view audit activity
* manage platform-level configuration

Design the authorization model so additional roles can be introduced later.

---

# 6. DATABASE MODEL

Use the following as the initial domain model.

## Users

`users`

* id
* full_name
* email
* role
* avatar_url
* status
* created_at
* updated_at

The authentication identity must remain separate from application profile information.

---

## Courses

`courses`

* id
* title
* slug
* short_description
* description_html
* instructor_id
* status
* price_cents
* currency
* thumbnail_url
* created_at
* updated_at

Course status should support at least:

* draft
* published
* archived

Do not use only a boolean for lifecycle state.

---

## Modules

`modules`

* id
* course_id
* title
* description_html
* order_index
* created_at
* updated_at

---

## Lessons

`lessons`

* id
* module_id
* title
* lesson_type
* content_html
* video_url
* duration_seconds
* is_preview
* order_index
* status
* created_at
* updated_at

Lesson types:

* video
* text
* quiz
* assignment

Design the frontend so additional lesson types can be introduced later.

---

## Enrollments

`enrollments`

* id
* user_id
* course_id
* status
* enrolled_at
* completed_at
* created_at
* updated_at

Statuses:

* pending
* active
* completed
* cancelled
* refunded

Unique constraint:

```text
(user_id, course_id)
```

---

## Lesson Progress

`lesson_progress`

* id
* user_id
* lesson_id
* status
* last_position_seconds
* completed_at
* updated_at

Statuses:

* not_started
* in_progress
* completed

Unique constraint:

```text
(user_id, lesson_id)
```

---

# 7. QUIZ SYSTEM

Create:

### quizzes

* id
* lesson_id
* passing_score_percent
* created_at
* updated_at

### quiz_questions

* id
* quiz_id
* question_text
* order_index
* created_at
* updated_at

### quiz_options

* id
* question_id
* option_text
* is_correct
* order_index
* created_at
* updated_at

### quiz_attempts

* id
* user_id
* quiz_id
* score_percent
* passed
* started_at
* submitted_at

The UI must support:

* quiz creation
* question creation
* option creation
* selecting correct answer
* question ordering
* quiz preview
* quiz attempt
* result display
* retry
* attempt history

Do not expose correct answers to the student before submission.

---

# 8. CERTIFICATES

Create:

`certificates`

* id
* user_id
* course_id
* certificate_code
* issued_at
* revoked_at
* certificate_url
* status

Certificate statuses:

* issued
* revoked

Certificate codes must be unique.

Provide:

* certificate listing
* certificate detail
* verification-friendly certificate code
* download/view action
* administrator reissue
* administrator revoke

Design the frontend so a future public certificate verification page can be added.

---

# 9. PAYMENTS

Create:

`payments`

* id
* user_id
* course_id
* amount_cents
* currency
* provider
* provider_reference
* status
* created_at
* updated_at

Providers:

* mpesa
* stripe
* manual

Statuses:

* pending
* succeeded
* failed
* refunded

IMPORTANT:

Do not place payment provider logic inside React components.

The frontend only calls functions such as:

```ts
initializePayment()
getPayment()
getPaymentStatus()
```

The eventual Python backend will handle actual provider integration.

Initially implement a working manual/M-Pesa-ready flow.

---

# 10. AUDIT LOG

Because this is intended for enterprise use, introduce:

`audit_logs`

Fields:

* id
* user_id
* action
* entity_type
* entity_id
* metadata
* created_at

The UI should provide an administrator audit-log view.

Examples:

* user role changed
* course created
* course published
* course unpublished
* lesson modified
* enrollment created
* payment confirmed
* certificate issued
* certificate revoked

The frontend should expose service functions for retrieving audit records.

---

# 11. AUTHENTICATION

Initially use Supabase Auth.

Create:

* login
* registration
* logout
* password reset
* session restoration
* current-user retrieval

All authentication calls must live in:

`src/services/api.ts`

The UI must not import the Supabase client directly.

Create an application-level user object such as:

```ts
interface CurrentUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string;
}
```

---

# 12. ROUTING

Create protected route groups:

```text
/
 /courses
 /courses/:slug
 /login
 /register

 /student
 /student/courses
 /student/courses/:courseId
 /student/courses/:courseId/lessons/:lessonId
 /student/quizzes/:quizId
 /student/certificates
 /student/profile

 /instructor
 /instructor/courses
 /instructor/courses/new
 /instructor/courses/:courseId
 /instructor/courses/:courseId/builder
 /instructor/courses/:courseId/students
 /instructor/courses/:courseId/analytics

 /admin
 /admin/dashboard
 /admin/users
 /admin/courses
 /admin/enrollments
 /admin/payments
 /admin/certificates
 /admin/audit
 /admin/settings
```

Implement route protection by role.

---

# 13. PUBLIC WEBSITE

Build a professional academy website.

### Home

Include:

* hero
* academy introduction
* featured courses
* benefits
* learning process
* testimonials
* CTA
* footer

### Course Catalog

Support:

* search
* category/filter structure
* course cards
* price
* instructor
* published status
* pagination-ready architecture

### Course Detail

Display:

* title
* instructor
* description
* modules
* lessons
* lesson durations
* preview lessons
* price
* enrollment/purchase CTA

---

# 14. STUDENT DASHBOARD

Create a professional student dashboard.

Display:

* enrolled courses
* course progress
* recently accessed lesson
* completed courses
* certificates
* pending quizzes
* overall learning statistics

Course cards should display:

```text
Course
Progress %
Lessons completed
Continue Learning
```

---

# 15. COURSE PLAYER

Create a serious LMS course-player experience.

Layout:

```text
------------------------------------------------
| Course | Modules / Lessons | Main Content    |
------------------------------------------------
```

Sidebar:

* modules
* lessons
* completion indicators
* locked/unlocked states

Main content:

For video:

* video player
* title
* duration
* progress
* completion

For text:

* formatted lesson content
* completion control

For quiz:

* launch quiz

Provide:

* Previous lesson
* Next lesson
* Mark complete
* Continue learning

Automatically save video position.

Automatically mark a video complete when it reaches the end.

---

# 16. COURSE BUILDER

Build a complete instructor course builder.

Instructor should be able to:

1. Create course
2. Edit course information
3. Upload/select thumbnail
4. Add modules
5. Reorder modules
6. Add lessons
7. Reorder lessons
8. Edit lesson content
9. Configure video
10. Mark lesson as preview
11. Create quizzes
12. Add questions
13. Add options
14. Select correct answers
15. Configure passing score
16. Preview course
17. Save draft
18. Publish

Use drag-and-drop ordering where practical.

Do not make the course builder a single giant form.

Use clear sections/tabs/panels.

---

# 17. INSTRUCTOR ANALYTICS

Display:

* total courses
* published courses
* total enrollments
* completion rate
* average quiz score
* students per course

Course-level analytics:

* enrolled students
* completed students
* active students
* progress distribution
* quiz performance

The analytics implementation should use service functions rather than querying the database from components.

---

# 18. ADMIN DASHBOARD

Create an enterprise-style admin dashboard.

Show:

* total students
* instructors
* courses
* published courses
* active enrollments
* completed courses
* payments
* certificates issued
* recent activity

Include charts where useful.

Do not create meaningless decorative charts.

Every displayed statistic should come from a service/API function.

---

# 19. ADMIN USER MANAGEMENT

Create:

* user table
* search
* filtering
* role management
* status management
* user detail
* enrollment summary
* activity summary

Roles:

* student
* instructor
* admin

Make the role system extensible.

---

# 20. ADMIN COURSE MANAGEMENT

Create:

* course list
* search
* filtering
* status
* instructor
* enrollment count
* publish/unpublish
* archive
* edit

Use confirmation dialogs for destructive actions.

---

# 21. ADMIN PAYMENT MANAGEMENT

Create:

* payment table
* payment status
* provider
* amount
* course
* student
* reference
* date

Allow authorized administrators to manually confirm payments during the initial phase.

When a payment is successfully confirmed, enrollment should be created/activated through the service layer.

Do not implement this business rule directly inside a React component.

---

# 22. ADMIN CERTIFICATE MANAGEMENT

Create:

* certificate table
* student
* course
* certificate code
* issue date
* status
* revoke
* reissue
* view/download

---

# 23. API SERVICE FILE

Create:

`src/services/api.ts`

This should be the central integration point.

Organize functions logically:

```ts
// Authentication

login()
register()
logout()
getCurrentUser()
resetPassword()

// Users

getUsers()
getUser()
updateUser()
updateUserRole()
updateUserStatus()

// Courses

getCourses()
getPublishedCourses()
getCourse()
createCourse()
updateCourse()
deleteCourse()
publishCourse()
unpublishCourse()

// Modules

getModules()
createModule()
updateModule()
deleteModule()
reorderModules()

// Lessons

getLessons()
getLesson()
createLesson()
updateLesson()
deleteLesson()
reorderLessons()

// Enrollment

getEnrollments()
getEnrollment()
enrollInCourse()
updateEnrollmentStatus()

// Progress

getCourseProgress()
getLessonProgress()
updateLessonProgress()
markLessonComplete()

// Quizzes

getQuiz()
createQuiz()
updateQuiz()
deleteQuiz()
getQuizQuestions()
createQuizQuestion()
updateQuizQuestion()
deleteQuizQuestion()
createQuizOption()
updateQuizOption()
deleteQuizOption()
submitQuizAttempt()
getQuizAttempts()

// Certificates

getCertificates()
getCertificate()
issueCertificate()
revokeCertificate()

// Payments

createPayment()
getPayment()
getPayments()
updatePaymentStatus()

// Analytics

getStudentDashboardStats()
getInstructorDashboardStats()
getCourseAnalytics()
getAdminDashboardStats()

// Audit

getAuditLogs()
```

Add additional functions wherever required by the UI.

---

# 24. API TYPES

Create centralized TypeScript types/interfaces.

For example:

```ts
type UserRole = "student" | "instructor" | "admin";

type CourseStatus = "draft" | "published" | "archived";

interface Course {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    descriptionHtml: string;
    instructorId: string;
    status: CourseStatus;
    priceCents: number;
    currency: string;
    thumbnailUrl?: string;
    createdAt: string;
    updatedAt: string;
}
```

Create corresponding types for:

* User
* Course
* Module
* Lesson
* Enrollment
* LessonProgress
* Quiz
* QuizQuestion
* QuizOption
* QuizAttempt
* Certificate
* Payment
* AuditLog
* Dashboard statistics

The UI must consume these application-level types.

---

# 25. ERROR HANDLING

Create a consistent API error model.

Example:

```ts
interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}
```

All service functions should normalize errors.

Components should not need to understand:

* Supabase errors
* PostgreSQL errors
* HTTP errors
* provider-specific errors

The future Python backend must be able to return the same application-level error structure.

---

# 26. LOADING AND EMPTY STATES

Every asynchronous page must have:

* loading state
* error state
* empty state
* success state

Use skeleton loaders where appropriate.

Avoid blank screens while data loads.

---

# 27. DATA ACCESS RULE

Do NOT do this:

```tsx
import { supabase } from "@/lib/supabase";

const { data } = await supabase
    .from("courses")
    .select("*");
```

inside a component.

Instead:

```tsx
import { getCourses } from "@/services/api";

const courses = await getCourses();
```

This rule applies everywhere.

---

# 28. SUPABASE IMPLEMENTATION

Supabase is the initial implementation only.

Create a Supabase client in its own infrastructure file.

However:

**Only `src/services/api.ts` may use it for application data operations.**

Do not import the Supabase client into:

* pages
* components
* hooks
* dashboards
* course builder
* quiz UI
* payment UI

The future migration should therefore involve primarily replacing the implementation inside `api.ts`.

---

# 29. FUTURE PYTHON BACKEND

Design the frontend service functions as though the eventual backend exposes endpoints such as:

```text
POST   /api/auth/login
POST   /api/auth/register
GET    /api/me

GET    /api/courses
POST   /api/courses
GET    /api/courses/{id}
PUT    /api/courses/{id}
DELETE /api/courses/{id}

GET    /api/courses/{id}/modules
POST   /api/courses/{id}/modules

GET    /api/modules/{id}/lessons
POST   /api/modules/{id}/lessons

POST   /api/courses/{id}/enroll
GET    /api/my/enrollments

GET    /api/lessons/{id}/progress
PUT    /api/lessons/{id}/progress

GET    /api/quizzes/{id}
POST   /api/quizzes/{id}/attempts

GET    /api/my/certificates

POST   /api/payments
GET    /api/payments/{id}

GET    /api/admin/dashboard
GET    /api/instructor/dashboard
```

Do not implement the Python backend now.

Simply ensure the frontend architecture can transition to it cleanly.

---

# 30. BUSINESS LOGIC

Do not duplicate business rules across components.

Examples:

Course completion logic should eventually be controlled by the backend.

Payment → enrollment logic should eventually be controlled by the backend.

Certificate issuance eligibility should eventually be controlled by the backend.

Quiz scoring should eventually be validated by the backend.

The frontend may provide immediate UX feedback, but must not be considered the authoritative source.

Design the service layer so these operations can later become backend operations without changing the UI.

---

# 31. SECURITY

Implement the frontend assuming the backend will enforce authorization.

Do not trust:

* hidden buttons
* frontend route protection
* role values stored only in local state
* client-side payment success
* client-side quiz scores

Frontend authorization is for UX.

Backend authorization will eventually be authoritative.

---

# 32. RESPONSIVE DESIGN

The system must work properly on:

* desktop
* tablet
* mobile

The course player should be particularly usable on mobile.

Admin tables should become responsive rather than simply overflowing the screen.

---

# 33. DESIGN SYSTEM

Use a professional corporate academy aesthetic.

Prioritize:

* clarity
* trust
* professionalism
* accessibility
* strong typography
* clean cards
* restrained use of color
* consistent spacing
* clear CTAs

Create reusable:

* buttons
* cards
* badges
* tables
* dialogs
* forms
* dropdowns
* tabs
* breadcrumbs
* progress indicators
* skeletons
* empty states
* confirmation dialogs

---

# 34. SEED DATA

Create realistic seed data for:

* 2 courses
* multiple modules per course
* multiple lessons per module
* video lessons
* text lessons
* quiz lessons
* quiz questions/options
* sample instructor
* sample student
* sample enrollment
* sample progress
* sample quiz attempts

Do not make the seed data look like generic placeholder content.

Use realistic Executive Assistant / Personal Assistant training content.

---

# 35. FILE STRUCTURE

Use a maintainable structure similar to:

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
│   └── api.ts
├── types/
├── lib/
│   └── supabase.ts
├── contexts/
├── utils/
└── App.tsx
```

Keep `api.ts` as the primary application data boundary.

---

# 36. IMPORTANT IMPLEMENTATION CONSTRAINT

Do not optimize for "Lovable demo completeness".

Optimize for **future backend replacement**.

When a Python backend is introduced, we should ideally be able to replace:

```text
Supabase implementation
```

with:

```text
HTTP/Python implementation
```

inside the service layer while leaving:

```text
pages
components
layouts
forms
dashboards
course player
course builder
quiz UI
admin UI
```

unchanged.

That is one of the primary architectural acceptance criteria.

---

# 37. DELIVERABLE

Generate the complete working frontend application.

It must include:

1. Public academy
2. Authentication
3. Student dashboard
4. Course catalog
5. Course detail
6. Course player
7. Progress tracking
8. Quizzes
9. Certificates
10. Instructor dashboard
11. Course builder
12. Instructor analytics
13. Admin dashboard
14. User management
15. Course management
16. Enrollment management
17. Payment management
18. Certificate management
19. Audit logs
20. Responsive design
21. Supabase implementation
22. Centralized API/service layer
23. Strong TypeScript types
24. Loading/error/empty states
25. Seed data

Before finishing, verify that **no React component directly imports or uses the Supabase client for application data access**.

All application data operations must flow through:

`src/services/api.ts`

The resulting application should be treated as **Version 1 of an enterprise LMS**, not a throwaway prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5000a8d-a3c8-41ef-8b60-44c5ea64e9a7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
