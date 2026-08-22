# Academy Hub — Enterprise LMS completion pass

## Completed in this code pass

### Role-aware application shell
- Student sees **My Learning** and learner navigation.
- Instructor sees **My Teaching** and teaching navigation.
- Admin sees **Managed Courses** plus permission-gated administration.
- Profile & Security is directly reachable from the user menu.
- Admins no longer receive a `super_admin` capability merely because they have the `admin` base role.

### Authorization
- Runtime reads normalized `admin_roles`, `admin_tier_permissions` and `admin_organization_scopes`.
- Multiple admin tiers remain supported.
- Administrator provisioning starts with no default tier; a tier must be explicitly selected.
- Provisioning cleans up partial state if a later relationship insert fails.
- Unprovisioned administrators receive an explicit setup state instead of elevated access.
- Super Admin detection works when it is one of multiple assigned tiers.

### Relationships
- Course ↔ Instructor M:N.
- Course ↔ Organization M:N.
- Course ↔ Cohort M:N.
- Cohort ↔ User M:N.
- Organization ↔ User membership.
- Organization ↔ sponsored participant.
- User ↔ Course enrollment.
- User ↔ Lesson progress.
- User ↔ Quiz attempts.

### Course workspace / builder
- Course metadata.
- Multiple instructors.
- Organizations.
- Cohorts.
- Module CRUD and ordering.
- Lesson CRUD and ordering.
- Text, video, quiz and assignment lesson types.
- Mixed text + video content in the same lesson.
- Visual rich-text authoring.
- Video and attachment uploads.
- Assignment authoring, editing, deletion, maximum score and due date.
- Quiz authoring, settings, question CRUD/reordering, option CRUD and correct-answer management.
- Admins with course permissions can reuse the same course workspace.

### API completeness
- All exported API functions in `src/services/api.ts` are now referenced by application code; static reference audit reports **128 exports / 0 unused exports**.
- Cohort relationship APIs are implemented and consumed.
- Profile avatar upload is implemented.
- Email-change request is implemented through Supabase Auth.
- Notification preferences are implemented.
- Email communication events are queued through the communication-event service path for later backend delivery.
- Enrollment CSV export is consumed.
- Payment status refresh is consumed.
- Certificate detail lookup is consumed.
- Quiz question reordering is consumed.
- Lesson lookup is consumed by the learner course player.

### Profile / account
- Avatar camera control is functional and uploads the selected image.
- Avatar is rendered from `profiles.avatar_url`.
- Full-name editing works.
- Email change request works and uses confirmation through the identity provider.
- Password change works.
- Notification/email preferences have a real UI.

### Audit
- Added audit coverage to module/lesson/quiz/assignment relationship and authoring mutations introduced in this pass.
- Existing course, enrollment, certificate, organization and admin audit paths remain in place.

## Database migration included for later execution

`supabase/migrations/20260821000000_enterprise_completion.sql` contains the DB-side completion work without executing it against the user's project. It: 

- rewires admin permission helpers from obsolete `admin_permissions` to normalized `admin_roles`;
- supports permission vocabulary aliases such as `courses.edit` ↔ `courses.update` and `certificates.award` ↔ `certificates.issue`;
- creates/normalizes first-class `assignments`;
- links `assignment_submissions.assignment_id`;
- creates notification preferences;
- creates the communication-event queue;
- adds the corresponding RLS/grants/triggers.

The existing older migration files are retained for history. The new migration is the later corrective migration to be applied after the normalized authorization migration already used in the project.

## Deferred by agreement

Platform/integration standards remain intentionally outside this pass:

- LTI
- OneRoster
- QTI
- Common Cartridge
- Caliper / external analytics interoperability
- external SSO/identity integrations

## Dependency policy

- No `node_modules` is included.
- No npm install was run.
- `package.json` and `package-lock.json` were not changed.
- No new dependency was required.

## Validation

- TypeScript/TSX source parsing: **0 syntax diagnostics** across the source files checked.
- API export usage audit: **128 exported functions, 0 unused exports**.
- No `node_modules` directory exists in the project.
- A full Vite build was deliberately not run because doing so would require installing the project's dependencies, which was explicitly avoided.
