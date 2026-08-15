# Academy Hub — Enterprise UI/UX Redesign Brief

Redesign the existing Academy Hub application as a premium, production-grade enterprise Learning Management System.

The existing repository is the functional source of truth. Do not treat the current visual design as a constraint. You have broad creative freedom to rethink the application's UI and UX, including navigation, page composition, information hierarchy, visual language, component design, interaction patterns, responsive behavior, dashboards, tables, forms, course experiences and overall product structure.

The goal is not to cosmetically restyle the existing application. Reimagine the user experience while preserving the application's functional and architectural foundation.

## 1. Product model

Academy Hub is one platform serving three distinct user experiences:

### Student

Focused on:

- discovering courses
- enrolling/purchasing
- learning
- continuing lessons
- tracking progress
- completing quizzes
- viewing results
- earning certificates
- managing profile
- receiving learning notifications

### Instructor

Focused on:

- creating courses
- managing course structure
- creating modules and lessons
- managing lesson media
- creating quizzes
- reviewing submissions
- managing students
- monitoring course performance
- viewing analytics
- publishing/unpublishing courses

### Administrator

Focused on:

- platform operations
- users
- roles
- instructors
- organizations
- courses
- enrollments
- payments
- certificates
- audit activity
- settings
- platform analytics

Do not create one generic dashboard and merely change the data. These three experiences should have distinct information hierarchies while sharing a coherent design system.

## 2. Existing application architecture — DO NOT BREAK

The application currently follows this functional architecture:

UI
→ TanStack Router / React components
→ TanStack Query / page logic
→ src/services/api.ts
→ Supabase

The future architecture is:

UI
→ TanStack Router / React components
→ TanStack Query / page logic
→ src/services/api.ts
→ Python API
→ PostgreSQL

`src/services/api.ts` is the application's backend/data abstraction boundary.

React components, pages and UI components must NOT:

- directly query Supabase
- directly perform Supabase mutations
- directly access database tables
- directly implement authentication calls
- directly implement payment-provider calls
- directly implement backend business rules
- bypass the service layer

All data operations must continue through the existing service functions.

The eventual migration from Supabase to a Python backend must be possible without rewriting the redesigned UI.

Do not replace this architecture with a new data-fetching architecture merely to implement the redesign.

## 3. Preserve existing routes and functionality

The application uses TanStack Router and file-based routes.

Preserve the existing route semantics and workflows.

The redesign may reorganize the visual navigation and page composition, but it must not arbitrarily replace or remove routes.

Existing functional areas include:

Public:

- home
- course catalogue
- course detail
- authentication
- registration
- password reset
- verification

Authenticated:

- dashboard
- my courses
- course learning
- certificates
- notifications
- profile

Instructor:

- courses
- course builder
- students
- submissions
- analytics

Administrator:

- overview
- team
- organizations
- users
- enrollments
- payments
- certificates
- audit logs
- settings

## 4. Global UX

Create a sophisticated enterprise application shell.

You may rethink the current sidebar/topbar arrangement completely.

Explore:

- collapsible navigation
- role-aware navigation
- contextual navigation
- breadcrumbs
- global search
- command palette
- notification center
- profile menu
- organization context
- contextual page actions
- mobile navigation
- responsive behavior

Navigation should clearly communicate where the user is and what actions are available.

Avoid excessive nesting and avoid making the interface feel like an administrative form system.

## 5. Design language

Create a cohesive design system rather than styling each page independently.

Define:

- typography hierarchy
- spacing scale
- color system
- semantic colors
- surfaces
- borders
- elevation
- radius
- buttons
- inputs
- selects
- badges
- tabs
- cards
- tables
- dialogs
- drawers
- tooltips
- avatars
- progress indicators
- charts
- notifications
- skeleton loaders
- empty states
- error states

The visual language should communicate:

- premium
- professional
- trustworthy
- modern
- enterprise-grade
- educational
- calm
- highly usable

Avoid generic SaaS dashboard aesthetics and avoid excessive decorative elements.

## 6. Student dashboard

Reimagine the dashboard as a learning command center.

Prioritize:

- continue learning
- current course progress
- recently accessed lesson
- pending quizzes
- completed courses
- certificates
- learning statistics
- useful recommendations where supported by existing data

The existing service functions provide student dashboard statistics and enrollments. Continue consuming those functions rather than hardcoding data.

The dashboard should answer immediately:

1. What am I learning?
2. Where did I stop?
3. What should I do next?
4. How am I progressing?
5. What have I achieved?

## 7. Course catalogue

Create a premium academy catalogue experience.

Support:

- search
- filters
- course categories where available
- course cards
- instructor
- price
- status
- pagination-ready structure

You may completely rethink the card/grid/list composition.

Course cards should make the most important decision information immediately visible without becoming overloaded.

## 8. Course detail

Create a high-conversion course-detail experience.

Clearly communicate:

- course identity
- instructor
- description
- learning outcomes
- curriculum
- modules
- lessons
- lesson durations
- preview availability
- price
- enrollment/purchase action

The page should make the user confident about what they are purchasing and what they will learn.

## 9. Student course player

Give the course player significant design freedom.

This is a core learning environment, not another dashboard.

Support:

- modules
- lessons
- lesson completion
- progress
- locked/unlocked states
- video lessons
- text lessons
- quiz lessons
- previous/next navigation
- mark complete
- resume learning
- saved video position
- automatic completion behavior

Create a focused learning environment with minimal distraction.

The learner should always understand:

- current course
- current module
- current lesson
- progress
- what is completed
- what comes next

## 10. Instructor workspace

Design the instructor experience as a content-production workspace.

The course builder should NOT be one giant form.

Create a clear information architecture for:

- course overview
- curriculum
- lessons
- quizzes
- settings
- preview
- publishing

Support:

- modules
- lesson creation
- lesson editing
- drag-and-drop ordering
- media selection
- preview lessons
- quizzes
- questions
- answer options
- correct answers
- passing score
- save draft
- preview
- publish/unpublish

Make the curriculum feel like an editable content tree.

## 11. Instructor analytics

Create meaningful analytics.

Support the existing concepts:

- total courses
- published courses
- enrollments
- completion rate
- average quiz score
- students per course
- active students
- completed students
- progress distribution
- quiz performance

Do not create decorative charts.

Every statistic and chart must represent data returned through the application's service/API layer.

## 12. Administrator experience

Design administration as a professional platform operations console.

Prioritize:

- system overview
- users
- roles
- organizations
- courses
- enrollments
- payments
- certificates
- audit logs
- settings

Use information-dense but readable tables and operational dashboards.

The administrator should be able to understand system health and perform operational actions efficiently.

## 13. Enterprise tables

Create a reusable table system for:

- users
- courses
- enrollments
- payments
- certificates
- audit logs
- students
- submissions

Support where applicable:

- search
- filtering
- sorting
- pagination
- row actions
- bulk actions
- status badges
- column hierarchy
- detail views
- confirmation dialogs
- responsive behavior

Do not create a different table UX for every page.

## 14. Payments

Clearly represent:

- pending
- succeeded
- failed
- refunded

Support existing payment workflows without moving payment-provider logic into the UI.

The interface should make payment state and required action obvious.

## 15. Certificates

Create a polished certificate experience for students and administrators.

Student:

- certificate listing
- certificate detail
- certificate code
- issue date
- view/download

Administrator:

- certificate management
- issue
- revoke
- reissue
- view/download

Design with future public certificate verification in mind.

## 16. Notifications

Create a useful notification center.

Notifications should visually distinguish learning, teaching and administrative activity.

Support:

- notification bell
- unread state
- notification history
- relevant destination/action

## 17. Async states

Every asynchronous experience must have deliberate UX.

Design:

- loading
- skeleton loading
- empty
- error
- success
- mutation in progress
- disabled action
- retry
- confirmation
- destructive action confirmation

Never leave a user staring at a blank page while data is loading.

## 18. Data-driven UI

Do not hardcode application data into redesigned components.

Values such as:

- student counts
- course counts
- progress
- enrollment counts
- certificate counts
- payment totals
- quiz scores
- statuses
- course information

must continue coming from the existing service/API layer.

The redesign must work with real data and empty datasets.

## 19. Component strategy

Create reusable UI patterns.

If several pages need:

- a table
- filter bar
- status badge
- course card
- metric card
- page header
- confirmation dialog
- empty state
- loading state
- analytics chart
- user identity
- progress indicator

create or reuse a shared component rather than duplicating the design.

## 20. Responsive UX

The redesign must work across:

- desktop
- laptop
- tablet
- mobile

Do not simply shrink the desktop layout.

Determine how navigation, tables, course players, builders and dashboards should genuinely transform at smaller sizes.

## 21. Creative freedom

You have substantial freedom.

You may:

- change page layouts
- restructure navigation
- introduce new visual patterns
- introduce better information hierarchy
- redesign cards
- redesign tables
- redesign dashboards
- redesign the course player
- redesign the course builder
- redesign forms
- redesign filters
- introduce contextual actions
- introduce command/search patterns
- introduce meaningful animation
- improve accessibility
- improve responsive behavior

Do not assume that the current layout is the best solution.

The existing application is the functional baseline, not the visual baseline.

## 22. Non-negotiable constraints

Do NOT:

- remove existing functionality
- bypass `src/services/api.ts`
- introduce direct Supabase calls into UI
- replace the existing backend abstraction
- change business rules
- change authentication architecture
- expose provider/database objects to UI
- hardcode backend data
- replace working routes without a functional reason
- create decorative analytics unsupported by actual data
- turn the course builder into a giant form
- create a throwaway prototype disconnected from the real application

The final result should look substantially different and substantially better while remaining the same real application underneath.

## 23. Implementation principle

Think of the redesign as:

CURRENT FUNCTIONAL SYSTEM +
NEW ENTERPRISE DESIGN SYSTEM +
NEW INFORMATION HIERARCHY +
NEW INTERACTION MODEL
=====================

REDESIGNED ACADEMY HUB

The visual redesign should be ambitious.

The architecture should remain disciplined.
