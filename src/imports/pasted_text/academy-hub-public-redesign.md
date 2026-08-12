# Academy Hub — Extend the Existing Redesign to the Public Experience

The existing Academy Hub redesign is already visually strong. **Do not discard, restart, or replace the current design direction.**

Continue from the design system, visual language, components, typography, spacing, surfaces, colors, interaction patterns and overall product quality that have already been established.

The next task is to extend that same design quality to the **public and unauthenticated experience** so that Academy Hub feels like one coherent product from the moment a visitor arrives until they become an authenticated learner.

The existing logged-in experience should remain the visual and functional reference for the design system.

---

# 1. Academy Hub has two connected experiences

The complete product consists of:

## Public / Discovery Experience

Visitors who are not authenticated should be able to:

* understand what Academy Hub is
* discover available learning
* browse courses
* search courses
* filter courses
* inspect course details
* understand instructors and course content
* understand pricing where applicable
* preview available content
* decide to enroll/purchase
* create an account
* sign in
* recover their account

## Authenticated Experience

After authentication, users enter the existing role-specific platform:

* Student
* Instructor
* Administrator

The public experience must feel like the natural entrance to the same platform, not a completely different website.

---

# 2. Public navigation

Create a polished public navigation system consistent with the existing Academy Hub design.

The public header should provide an intuitive path to:

* Academy Hub home
* Courses / Catalogue
* relevant discovery sections
* Sign in
* Get started / Register

Where appropriate, allow the design to include:

* global course search
* prominent call-to-action
* user-aware navigation when already authenticated
* responsive mobile navigation
* contextual navigation

Do not simply reuse the authenticated sidebar.

The public experience should have its own navigation pattern optimized for discovery and conversion.

---

# 3. Homepage

The homepage is one of the most important missing pieces from the previous redesign.

It should be treated as the **front door of Academy Hub**.

Do not make it look like a dashboard.

It should communicate the value of the platform within seconds.

The homepage should answer:

1. What is Academy Hub?
2. Who is it for?
3. What can I learn here?
4. Why should I trust it?
5. How do I find a course?
6. What should I do next?

You have broad creative freedom to determine the exact composition.

Possible content areas may include:

### Hero

A strong, premium introduction to Academy Hub.

Potential structure:

* clear headline
* concise value proposition
* primary CTA
* secondary CTA
* visual representation of the learning experience

Primary CTA could lead toward course discovery or getting started.

Do not use generic SaaS copy or a generic LMS template aesthetic.

The homepage should feel like a real academy/product brand.

---

# 4. Course discovery from the homepage

The homepage should connect naturally to the catalogue.

Where actual course data is available through the application's service layer, the homepage may surface dynamic course content such as:

* featured courses
* popular courses
* recently published courses
* recommended discovery sections
* categories

However:

**Do not invent or hardcode course data merely to create visual sections.**

If the backend currently exposes only certain public course data, design the experience around that available data.

The UI must consume course information through the existing API/service abstraction.

Do not introduce direct database access into the homepage.

---

# 5. Homepage course sections

Create reusable course presentation patterns that remain consistent with the authenticated application.

For example:

### Featured learning

Large/highlighted course presentation.

### Explore courses

A compact course grid or horizontal discovery pattern.

### Popular / recommended

Only where the existing data model/API supports it.

### Categories

Only where supported by actual course data.

Figma has freedom to determine whether these should be:

* cards
* horizontal carousels
* featured layouts
* editorial sections
* grouped collections

Do not assume every course needs to be presented as the same card.

---

# 6. Homepage trust and value proposition

The homepage should not be only:

Hero → Course cards → Footer.

Build a complete product narrative.

Where appropriate, include sections communicating:

* learning outcomes
* quality of instructors
* structured learning
* progress tracking
* assessments
* certificates
* enterprise/organizational learning
* platform capabilities

Only represent capabilities that actually exist or are supported by the application.

Do not fabricate product claims.

The goal is to explain the value of Academy Hub, not simply decorate the page.

---

# 7. Course Catalogue

The catalogue is the primary public discovery environment.

It should feel like a professional academy rather than a basic database list.

Support the application's existing functionality for:

* searching courses
* filtering courses
* viewing published courses
* viewing course cards
* opening course details
* pagination-ready results

Create a clear discovery hierarchy.

Potential structure:

Course Catalogue

Search courses...

Filters

Featured / relevant results

Course results

Pagination

The exact layout is up to you.

Explore whether the best experience is:

* grid
* list
* hybrid
* featured + grid
* responsive combinations

Do not sacrifice usability for visual novelty.

---

# 8. Catalogue filtering

Filtering should feel deliberate and easy to understand.

Where the underlying application supports the relevant attributes, allow users to filter by things such as:

* category
* instructor
* price
* level
* availability/status
* other supported course attributes

Do not create filters for data that the application does not actually provide.

On desktop, filters may be persistent or contextual.

On mobile, consider a filter drawer/sheet.

The user should always understand:

* what filters are active
* how many results remain
* how to clear filters

---

# 9. Course cards

Create a strong reusable public course-card system.

A course card should communicate the information needed to decide whether to inspect the course.

Depending on available data, this may include:

* course image
* course title
* instructor
* price
* lesson/module information
* duration
* level
* publication state
* progress for authenticated users where appropriate

Do not overload the card.

Create different visual treatments where useful:

* featured course
* standard course
* compact course
* enrolled course
* completed course

The same design system should be reusable across public and authenticated experiences.

---

# 10. Course Details — Public Experience

The public course-detail page should be treated as a major conversion and information page.

The user should be able to understand the course without needing to log in.

Clearly communicate:

* course title
* course description
* instructor
* price
* course duration where available
* modules
* lessons
* lesson durations where available
* preview lessons
* learning outcomes
* enrollment/purchase action

The design should make the user confident about the value of the course.

---

# 11. Course-detail information hierarchy

Do not simply place every field into a vertical list.

Create a strong hierarchy.

For example:

Course identity
↓
Value proposition
↓
Primary enrollment action
↓
What you'll learn
↓
Curriculum
↓
Instructor
↓
Additional information
↓
Final enrollment CTA

The exact order is yours to determine.

The primary action should remain visually obvious without becoming aggressive.

---

# 12. Course curriculum preview

The curriculum should be visually understandable before enrollment.

Represent:

* modules
* lessons
* lesson duration
* preview availability
* locked content

Example conceptual structure:

Module 1

* Preview lesson
* Lesson
* Lesson

Module 2

* Locked lesson
* Locked lesson
* Quiz

However, redesign this freely.

The curriculum should communicate the structure and depth of the course without exposing content that should remain restricted.

---

# 13. Preview experience

If a lesson is marked as previewable by the existing application, make that distinction clear.

The public user should be able to understand:

* what can be previewed
* what requires enrollment
* what is locked
* what action unlocks the remaining course

Do not bypass the application's existing access rules.

The UI must respect the actual lesson-access state returned by the application.

---

# 14. Enrollment / purchase journey

This is a critical bridge between public and authenticated experiences.

The journey should be extremely clear:

Public course
↓
Enroll / Purchase
↓
Authentication if required
↓
Payment/enrollment
↓
Successful enrollment
↓
Learning experience

Do not assume the user is already authenticated.

If an unauthenticated visitor attempts an action requiring authentication:

* preserve their intended destination/action where supported
* guide them naturally to authentication
* avoid making them feel like they have lost their place

The design should make authentication feel like part of the journey rather than an unrelated interruption.

---

# 15. Login

The login page should belong visually to Academy Hub but remain focused.

Support the existing authentication workflow.

The design should include:

* email/credential fields supported by the current application
* password
* sign-in action
* forgot password
* registration path
* appropriate loading/error states

Do not introduce a different authentication architecture.

Do not add authentication providers that do not exist.

---

# 16. Registration

Registration should feel like a natural continuation of the public experience.

It should communicate:

* what the user is signing up for
* required information
* account creation
* transition into Academy Hub

Avoid making registration unnecessarily complex.

Where role selection exists in the actual application, present it appropriately.

Do not expose administrative or instructor functionality simply because the interface looks capable of doing so.

Authorization remains controlled by the application's existing logic.

---

# 17. Password recovery

Design the complete recovery journey consistently:

Forgot password
↓
Enter email
↓
Confirmation
↓
Reset password
↓
Success
↓
Return to login

Include:

* loading states
* invalid email/error state
* expired/invalid reset state
* successful reset
* clear next action

Do not design only the happy path.

---

# 18. Verification and authentication states

Design the relevant authentication states that already exist in the application.

Examples may include:

* email verification
* verification pending
* verification success
* verification failure
* expired link
* invalid link
* authenticated redirect
* session expiration

The exact states should follow the actual application.

These should feel like polished product experiences rather than raw error screens.

---

# 19. Public empty/error/loading states

Public pages also need complete state design.

Examples:

Catalogue loading:

* skeleton course cards

No search results:

* clear explanation
* reset filters action

Course unavailable:

* informative state
* return to catalogue

Course loading:

* structured skeleton

Authentication failure:

* actionable error

Network failure:

* retry

Do not leave these states to default browser/UI behavior.

---

# 20. Footer

Create a proper Academy Hub public footer.

It should visually complete the marketing/discovery experience.

Where applicable, provide navigation to:

* courses
* relevant platform information
* authentication
* support/contact
* legal/privacy areas if they exist
* other existing public destinations

Do not invent routes that do not exist.

---

# 21. Public-to-authenticated transition

The transition from public Academy Hub to the authenticated LMS should feel seamless.

The user should recognize:

"This is the same Academy Hub."

Maintain consistency in:

* logo/brand
* typography
* colors
* buttons
* cards
* status language
* iconography
* spacing
* interaction patterns

But allow the public experience to feel more editorial/discovery-oriented while the authenticated experience remains more productivity-oriented.

This is an important distinction:

PUBLIC:
Discovery → confidence → conversion

STUDENT:
Learning → progress → achievement

INSTRUCTOR:
Creation → management → performance

ADMIN:
Operations → governance → insight

---

# 22. Data fetching and API architecture

This is NON-NEGOTIABLE.

The redesign must preserve the existing data-fetching architecture.

Current conceptual architecture:

UI
→ TanStack Query / existing page logic
→ src/services/api.ts
→ Supabase

Future architecture:

UI
→ TanStack Query / existing page logic
→ src/services/api.ts
→ Python backend
→ PostgreSQL

The public pages must also respect this architecture.

For example:

Home
→ existing public API/service function
→ course data

Catalogue
→ existing course-fetching function
→ course results

Course detail
→ existing course-detail function
→ course/modules/lessons

Authentication
→ existing authentication functions

Enrollment
→ existing enrollment function

Payment
→ existing payment function

Do NOT introduce direct Supabase calls into public pages.

Do NOT bypass src/services/api.ts.

Do NOT create a second API/data layer merely for the redesigned public pages.

---

# 23. Public data must remain dynamic

Do not hardcode:

* course names
* prices
* instructor names
* lesson counts
* course statistics
* course availability
* enrollment state
* publication status

If the application can fetch the information, consume it.

If the application does not currently expose the information, design gracefully without inventing fake production data.

The UI should work with:

* populated data
* no courses
* one course
* many courses
* loading data
* failed requests

---

# 24. Do not change business rules

The redesign must not alter:

* course publication rules
* enrollment rules
* authentication rules
* payment rules
* lesson access
* preview access
* certificate eligibility
* role permissions
* organization permissions
* instructor permissions
* administrator permissions

The UI may communicate these rules much better, but it must not redefine them.

---

# 25. Extend the existing design system

The existing redesigned authenticated experience is the visual source of truth.

Do NOT create a separate "marketing website" design language.

Instead:

Existing authenticated design system
+
Public discovery patterns
=========================

One Academy Hub product

The public side may use more spacious/editorial compositions, larger visual storytelling and stronger discovery-oriented layouts, but it must remain recognizably Academy Hub.

---

# 26. Responsive public experience

Design the complete public journey for:

* desktop
* laptop
* tablet
* mobile

Do not simply shrink desktop layouts.

Consider how:

* navigation
* hero
* course grids
* filters
* course curriculum
* enrollment CTA
* authentication forms
* footer

transform at smaller sizes.

On mobile, primary actions should remain immediately accessible.

---

# 27. Accessibility and usability

Maintain strong:

* contrast
* keyboard navigation
* focus states
* form labels
* readable typography
* touch targets
* semantic hierarchy
* error messaging
* accessible dialogs/drawers

Do not sacrifice accessibility for visual effects.

---

# 28. Final product experience

The complete Academy Hub journey should feel like:

VISITOR

Landing page
↓
Understand Academy Hub
↓
Explore courses
↓
Search/filter
↓
Course details
↓
Evaluate curriculum/instructor/value
↓
Enroll / Purchase
↓
Authentication if required
↓
Successful enrollment
↓
Student dashboard
↓
Continue learning
↓
Complete course
↓
Earn certificate

The public experience should therefore be treated as an integral part of the product, not as a separate marketing website.

---

# 29. Design freedom

The existing design is already good.

Do not redesign it simply for the sake of changing it.

Instead:

* preserve what is working
* extend the visual system
* improve consistency
* rethink public information hierarchy
* create stronger discovery flows
* make course discovery feel premium
* make course details persuasive and useful
* make authentication frictionless
* make the public-to-authenticated transition seamless

Where the current public UI is weak, you have broad freedom to improve it.

Where the current authenticated redesign is strong, use it as the foundation.

The final result should feel like one coherent, premium enterprise learning product from the first visit through advanced authenticated use.
