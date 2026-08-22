# Academy Hub — User Guide

## 1. What Academy Hub does

Academy Hub manages courses, learners, instructors, organisations, cohorts, assessments, submissions, certificates, payments, notifications and administrative access.

The system shows different workspaces according to the signed-in user's role:

- **Student:** My Learning — courses the student is enrolled in, lessons, quizzes, assignments, progress and certificates.
- **Instructor:** My Teaching — courses the instructor teaches, curriculum, learners, submissions, grading and course outcomes.
- **Administrator:** Administration — users, instructors, courses, organisations, cohorts, enrollments, payments, certificates, audit and settings according to the administrator's tier and scope.

## 2. Profile and security

Open **Profile & Security** from the account menu.

You can:
- Change your name.
- Upload a profile photo. The image is stored in the Academy Hub Supabase Storage bucket and the profile keeps its stored media URL.
- Request an email-address change.
- Change your password.

## 3. Students

### Find a course
Open the course catalogue and choose a published course.

### Learn a course
Open an enrolled course. A course is organised as:

**Course → Module → Lesson**

Lessons can contain written content, video, quizzes and assignments. A lesson may contain both written content and a video.

### Track progress
Academy Hub records lesson completion and course progress. Continue from the course's current progress point.

### Quizzes and assignments
Complete quizzes and submit assignment work from the relevant lesson. Grades and feedback appear after marking.

### Certificates
Issued certificates appear under **My Certificates**.

## 4. Instructors

### My Teaching
Open **My Teaching** to see courses assigned to you.

### Create a course
Create a draft course, then open its course workspace.

### Build the curriculum
A course contains modules. Each module contains ordered lessons.

For a lesson you can:
- Edit the title.
- Add formatted written content.
- Upload a video to Academy Hub Storage.
- Upload images and attachments.
- Preview uploaded media before saving.
- Set duration.
- Mark the lesson as a preview lesson.
- Publish or keep it as a draft.
- Add an assignment or quiz.

### Course thumbnail
Upload the course thumbnail from the Course Details section. The image is stored in Supabase Storage and the resulting media reference is saved with the course.

### Course team and delivery
A course can have multiple instructors, organisations and cohorts. These relationships are independent of the course's curriculum.

### Learners
Open **Learners** from a course to see enrolled students and their progress. Select a learner to see their progress, submissions and certificates for that course.

## 5. Administrators

Administrator access is permission-driven.

An administrator can have one or more administrative tiers, for example:

- Super Admin
- Platform Admin
- Academic Admin
- Finance Admin
- User Admin
- Compliance Admin
- Organisation Admin

The tier determines permissions. Organisation scope determines which organisations the administrator can operate on.

### Users
Open **Users** to search learners, instructors and administrators. Select a person to open their detailed view.

The administrator can see the person's enrolments, course progress, lesson activity, submissions and certificates when permitted.

### Instructors
Administrators can manage instructor accounts and inspect the courses they teach and their learner activity according to permission and scope.

### Organisations
Organisations can have members, sponsored participants and cohorts. Courses can be connected to organisations and cohorts.

### Cohorts
A cohort belongs to an organisation and can contain multiple users and multiple courses.

### Courses
Administrators can manage courses when their permission allows it. The same course workspace is reused rather than creating a separate administrative course system.

### Audit
Important administrative and academic mutations are recorded in the audit system.

## 6. Media and files

Uploaded course media is stored in the `course-media` Supabase Storage bucket rather than being embedded in database records.

The application stores the media reference on the relevant resource and displays the file when that resource is opened.

Supported common media includes images, video and documents. File size and MIME type restrictions are enforced by the storage configuration.

## 7. Understanding access

The system answers five questions in order:

1. Who is the user?
2. What role do they have?
3. If they are an administrator, which tier(s) do they have?
4. What permissions do those tiers provide?
5. Which organisation or resource relationship gives them access to the particular record?

For example, an instructor can edit a course because they have the instructor capability **and** the `course_instructors` relationship connects them to that course.

An administrator may have a broader permission but still be limited by their organisation scope.

## 8. Platform integrations

External enterprise integrations such as LTI, OneRoster, QTI and other platform-integration standards are intentionally outside the current implementation scope.
