# Smart Attendance Management

## Product Requirements Document (PRD)

### 1. Project Objective

Build a simple, functional **Smart Attendance Management** web application for a college.

The college has approximately:

* 5,000 students
* 200 faculty members
* Multiple departments
* Multiple classes/sections
* Multiple subjects

The system must support the core assignment requirements:

1. Attendance recording
2. Attendance corrections
3. Attendance review
4. Attendance history
5. Identification of students with low attendance

The application should prioritize **correct functionality and data handling over visual design**.

Do not add features that are not required by this PRD.

---

# 2. Technology Stack

Use exactly this stack:

## Frontend

* React.js
* JavaScript
* Bootstrap OR Materialize CSS
* React Router if routing is required

Use Bootstrap by default unless there is a specific reason to use Materialize.

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## API

* REST API
* JSON request/response format

Do not introduce:

* Next.js
* TypeScript
* SQL database
* Redis
* Kafka
* Microservices
* WebSockets
* Docker/Kubernetes
* External attendance services
* AI/ML functionality

---

# 3. Scope

The application must contain only the following functional areas:

### A. Faculty/User Login

### B. Student Management

### C. Attendance Recording

### D. Attendance Review and History

### E. Attendance Correction

### F. Low Attendance Identification

These features should work together as one complete workflow.

---

# 4. User Role

For this prototype, use one application user type:

## Faculty

Faculty users can:

* Log in
* View students
* Record attendance
* View attendance records
* Correct attendance records
* View student attendance history
* View students with low attendance

Do not create separate student, parent, admin, HOD, or management portals.

The assignment allows the candidate to decide users and permissions, so this implementation intentionally keeps the user model simple for the assessment.

---

# 5. Core Data Model

Use MongoDB with Mongoose.

Create the following main collections/models.

## 5.1 User

Represents faculty users.

Fields:

```text
_id
name
email
password
```

Authentication can use a simple login implementation appropriate for the assessment.

---

## 5.2 Department

Fields:

```text
_id
name
```

Example:

```text
CSE
ECE
EEE
ME
```

---

## 5.3 Section

Represents a class/section.

Fields:

```text
_id
name
departmentId
```

Example:

```text
CSE-A
CSE-B
ECE-A
```

---

## 5.4 Student

Fields:

```text
_id
rollNumber
name
email
departmentId
sectionId
```

Each student belongs to one department and one section.

Example:

```text
rollNumber: "CSE001"
name: "Rahul Kumar"
email: "rahul@example.com"
departmentId: <CSE>
sectionId: <CSE-A>
```

---

## 5.5 Subject

Fields:

```text
_id
name
code
departmentId
```

Example:

```text
name: "Data Structures"
code: "CS301"
departmentId: <CSE>
```

---

## 5.6 Attendance

Each attendance document represents one student's attendance for one subject on one date.

Fields:

```text
_id
studentId
subjectId
facultyId
date
status
createdAt
updatedAt
```

`status` must only contain:

```text
PRESENT
ABSENT
```

Use Mongoose references where appropriate.

---

# 6. Attendance Uniqueness Rule

A student must not have multiple attendance records for the same:

```text
student + subject + date
```

Therefore, prevent duplicate attendance records for the same student, subject, and date.

Example:

If Rahul already has:

```text
Rahul
Data Structures
24-09-2026
PRESENT
```

the system must not create another attendance record for:

```text
Rahul
Data Structures
24-09-2026
```

Instead, the existing record should be corrected/updated if necessary.

---

# 7. Application Workflow

## 7.1 Login

User opens the application.

```text
Login Page
    |
    |-- Email
    |-- Password
    |
    └── Login
```

After successful login:

```text
Login
  ↓
Dashboard
```

Invalid credentials should show an appropriate error.

---

# 8. Dashboard

The dashboard should provide a simple overview of the attendance system.

Display only useful information related to the assignment.

Suggested information:

```text
Total Students
Total Subjects
Today's Attendance Records
Low Attendance Students
```

The dashboard is not the primary feature.

Keep it simple.

---

# 9. Student Management

Provide a student page where faculty can view students.

Required functionality:

* View student list
* Search students
* Add student

Student list should display:

```text
Roll Number
Name
Email
Department
Section
```

Add Student form:

```text
Roll Number
Name
Email
Department
Section
Save
```

Validation:

* Required fields must not be empty.
* Roll number should not be duplicated.
* Student must belong to a valid department and section.

Do not add:

* Student profile management
* Parent information
* Photo upload
* Documents
* Fees
* Notifications

---

# 10. Attendance Recording

This is one of the primary features.

Faculty selects:

```text
Department
Section
Subject
Date
```

Then the system retrieves students belonging to the selected section.

Example:

```text
Department: CSE
Section: CSE-A
Subject: Data Structures
Date: 24-09-2026
```

Display:

```text
Roll No    Student Name    Status
------------------------------------
CSE001     Rahul Kumar     Present
CSE002     Amit Kumar      Absent
CSE003     Priya Singh     Present
CSE004     Neha Sharma     Present
```

The faculty can select:

```text
Present
or
Absent
```

for every student.

Then:

```text
Save Attendance
```

The backend stores the attendance records.

---

# 11. Attendance Recording Validation

Before saving:

### Required selection

Department, section, subject, and date must be selected.

### Students

The selected section must have students.

If there are no students:

```text
No students found for this section.
```

### Status

Every displayed student must have a valid attendance status.

### Duplicate attendance

If attendance already exists for:

```text
student + subject + date
```

do not create another record.

The UI should clearly inform the user that attendance for that date/subject has already been recorded.

The user should be able to use the correction functionality instead.

---

# 12. Attendance Review

Provide a page to review existing attendance records.

Allow filtering by:

```text
Department
Section
Subject
Date
```

Display records such as:

```text
Date
Student
Roll Number
Subject
Status
Faculty
Action
```

Example:

```text
24-09-2026
Rahul Kumar
CSE001
Data Structures
PRESENT
Faculty Name
Edit
```

The review page must retrieve actual records from MongoDB through the backend API.

Do not use hardcoded attendance data.

---

# 13. Attendance Correction

Faculty must be able to correct an existing attendance record.

Example:

Existing record:

```text
Rahul Kumar
Data Structures
24-09-2026
ABSENT
```

Faculty selects:

```text
Edit
```

and changes:

```text
ABSENT → PRESENT
```

Then:

```text
Save
```

The backend updates the existing attendance record.

The system must not create a second attendance record during correction.

After correction, attendance calculations must use the updated status.

Example:

Before correction:

```text
Present = 20
Total = 30
Attendance = 66.67%
```

After changing one record from absent to present:

```text
Present = 21
Total = 30
Attendance = 70%
```

---

# 14. Attendance History

Provide student attendance history.

A faculty member should be able to select a student and view that student's attendance.

Example:

```text
Student:
Rahul Kumar
Roll Number:
CSE001
```

Display:

```text
Subject
Total Classes
Present
Absent
Attendance Percentage
```

Example:

```text
Data Structures
Total Classes: 30
Present: 24
Absent: 6
Attendance: 80%
```

Also display the underlying attendance history:

```text
Date          Subject              Status
------------------------------------------------
01-09-2026    Data Structures      PRESENT
03-09-2026    Data Structures      PRESENT
05-09-2026    Data Structures      ABSENT
08-09-2026    Data Structures      PRESENT
```

This history must be calculated from actual attendance records.

---

# 15. Attendance Calculation

Use:

```text
Attendance Percentage =
(Present Count / Total Attendance Records) × 100
```

Example:

```text
Total = 30
Present = 24

24 / 30 × 100 = 80%
```

Absent count:

```text
Absent = Total - Present
```

Round the displayed percentage to two decimal places.

If the student has no attendance records:

```text
Attendance: No attendance data
```

Do not perform division by zero.

---

# 16. Low Attendance Identification

The system must identify students with low attendance.

Use a default attendance threshold of:

```text
75%
```

A student is considered low attendance when:

```text
Attendance Percentage < 75%
```

Therefore:

```text
75.00% → Not low attendance
74.99% → Low attendance
```

Provide a page:

```text
Low Attendance Students
```

Display:

```text
Student
Roll Number
Department
Section
Attendance Percentage
```

Example:

```text
Amit Kumar
CSE002
CSE
CSE-A
66.67%

Priya Singh
CSE003
CSE
CSE-A
73.33%
```

This list must be calculated from attendance records.

Do not manually store a `lowAttendance` field in the student document.

---

# 17. Low Attendance Filters

The low attendance page should allow basic filtering by:

```text
Department
Section
Subject
```

If Subject is selected, calculate attendance specifically for that subject.

If no subject is selected, calculate attendance using the student's attendance records across subjects available in the selected scope.

Keep this behavior consistent throughout the application.

---

# 18. REST API Requirements

Create a clean Express REST API.

Minimum required endpoints:

## Authentication

```text
POST /api/auth/login
```

## Students

```text
GET  /api/students
POST /api/students
```

## Departments

```text
GET /api/departments
POST /api/departments
```

## Sections

```text
GET /api/sections
POST /api/sections
```

## Subjects

```text
GET /api/subjects
POST /api/subjects
```

## Attendance

```text
POST /api/attendance
GET  /api/attendance
PUT  /api/attendance/:id
```

## Student Attendance History

```text
GET /api/attendance/student/:studentId
```

## Low Attendance

```text
GET /api/attendance/low
```

The exact query parameters can be designed according to the implementation, but filtering must support the required department, section, subject, student, and date use cases.

---

# 19. Backend Structure

Use a clean but simple Express structure.

Suggested structure:

```text
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── config/
├── utils/
└── server.js
```

Do not over-engineer the backend.

Use controllers for request handling and services only where business logic benefits from separation.

Attendance calculation logic should be reusable rather than duplicated across multiple controllers.

---

# 20. Frontend Structure

Suggested structure:

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
```

Use a reusable API service for backend requests.

Do not put large amounts of API logic directly inside UI components.

---

# 21. UI Requirements

The UI is intentionally simple.

Priority:

```text
Functionality
    >
Correct data
    >
Usability
    >
Visual design
```

Use Bootstrap components for:

* Forms
* Tables
* Buttons
* Navbar/sidebar
* Alerts
* Cards
* Modals where necessary

No complex animations.

No advanced visual design.

No unnecessary charts.

Tables and forms should be clear and usable.

---

# 22. Navigation

Use simple navigation:

```text
Dashboard
Students
Mark Attendance
Attendance History
Low Attendance
Logout
```

Keep navigation consistent across pages.

---

# 23. Error Handling

Backend should return appropriate HTTP status codes.

Examples:

```text
200 → successful request
201 → successfully created
400 → invalid request
401 → authentication failure
404 → resource not found
409 → duplicate/conflicting data
500 → unexpected server error
```

Frontend should display understandable error messages.

Do not expose raw server errors or stack traces to the user.

---

# 24. Important Edge Cases

The implementation must handle at least these cases:

### Case 1 — Duplicate student

Do not allow duplicate roll numbers.

### Case 2 — Duplicate attendance

Do not allow two attendance records for the same:

```text
student + subject + date
```

### Case 3 — No students

If a section contains no students, attendance cannot be recorded.

### Case 4 — No attendance history

Show:

```text
No attendance data available.
```

### Case 5 — Zero attendance records

Do not divide by zero.

### Case 6 — Attendance correction

Updating attendance must update calculated attendance percentages.

### Case 7 — 75% boundary

Exactly 75% must not appear in the low-attendance list.

### Case 8 — Invalid student/subject/section IDs

Backend must reject invalid references instead of creating invalid attendance records.

### Case 9 — Invalid attendance status

Only:

```text
PRESENT
ABSENT
```

are valid.

---

# 25. Sample Data

Create seed/sample data so the application can be demonstrated immediately.

Use a small demo dataset, for example:

### Departments

```text
CSE
ECE
```

### Sections

```text
CSE-A
CSE-B
ECE-A
```

### Subjects

```text
Data Structures
Database Management Systems
Operating Systems
```

### Faculty

```text
Demo Faculty
```

### Students

Create approximately 10–20 students for demonstration.

Include students with:

* High attendance
* Exactly 75% attendance
* Below 75% attendance

This allows the low-attendance functionality to be demonstrated.

Do not create 5,000 actual seed records just for the prototype.

The system's schema should be capable of handling the assignment's stated scale, while the demonstration dataset can remain small.

---

# 26. Example End-to-End Workflow

Example:

### Step 1

Faculty logs in.

```text
faculty@example.com
password
```

### Step 2

Faculty opens:

```text
Mark Attendance
```

### Step 3

Selects:

```text
Department: CSE
Section: CSE-A
Subject: Data Structures
Date: 24-09-2026
```

### Step 4

System loads all CSE-A students.

```text
Rahul    Present
Amit     Absent
Priya    Present
Neha     Present
```

### Step 5

Faculty clicks:

```text
Save Attendance
```

### Step 6

Backend creates attendance records.

### Step 7

Faculty opens:

```text
Attendance History
```

and sees the saved records.

### Step 8

Faculty discovers Rahul was incorrectly marked absent.

Faculty selects:

```text
Edit
```

and changes:

```text
ABSENT → PRESENT
```

### Step 9

The system updates Rahul's attendance record.

### Step 10

Faculty opens Rahul's attendance history.

The calculated attendance reflects the correction.

### Step 11

Faculty opens:

```text
Low Attendance
```

The system identifies students whose attendance is below 75%.

This completes the core business workflow.

---

# 27. Business Rules Summary

The implementation must follow these rules:

```text
1. Every student belongs to a department and section.

2. Subjects belong to departments.

3. Attendance belongs to a student, subject, faculty member, and date.

4. Attendance status can only be PRESENT or ABSENT.

5. One student cannot have duplicate attendance
   for the same subject and date.

6. Existing attendance is corrected by updating
   the existing record.

7. Attendance percentage =
   Present / Total × 100.

8. Attendance below 75% is considered low attendance.

9. Exactly 75% is not low attendance.

10. Attendance percentages must be calculated from
    attendance records, not manually stored values.

11. Attendance corrections must immediately affect
    attendance calculations.

12. Invalid references must not create attendance records.
```

---

# 28. Non-Functional Requirements

Keep these basic:

### Maintainability

Use a clear separation between frontend, backend, models, routes, and business logic.

### Data Integrity

Use Mongoose validation and appropriate MongoDB constraints/indexes.

### Usability

Forms and tables must be understandable without additional instructions.

### Performance

Use database queries efficiently enough for the stated college scale.

Do not prematurely optimize or introduce unnecessary infrastructure.

---

# 29. What NOT to Implement

Do not add functionality outside this PRD.

Specifically do not implement:

```text
Parent portal
Student portal
Student mobile app
Face recognition
QR attendance
Biometric attendance
GPS attendance
SMS
WhatsApp
Email notifications
Push notifications
Attendance prediction
AI/ML
Leave management
Fee management
Timetable management
Examination management
Payroll
Reports export
PDF generation
Excel import/export
Payment system
Chat system
Real-time notifications
Microservices
Redis
Kafka
```

The objective is to produce a focused working prototype for the Smart Attendance Management assessment.

---

# 30. Development Requirement for Codex

Build the application incrementally.

Recommended order:

```text
1. Project setup
2. MongoDB/Mongoose models
3. Backend API
4. Authentication
5. Student/department/section/subject management
6. Attendance recording
7. Attendance review/history
8. Attendance correction
9. Attendance calculation
10. Low attendance identification
11. Frontend integration
12. Validation and error handling
13. Seed/demo data
14. End-to-end testing
```

Do not generate the entire application blindly in one step.

After each major module:

* Run the application
* Test the API
* Test the UI
* Verify database records
* Fix errors before continuing

---

# 31. Acceptance Criteria

The project is considered complete only when all of these work:

* Faculty can log in.
* Faculty can view students.
* Faculty can add a student.
* Faculty can select department, section, subject, and date.
* Faculty can mark each student Present/Absent.
* Attendance is stored in MongoDB.
* Duplicate attendance for the same student/subject/date is prevented.
* Faculty can review attendance records.
* Faculty can view a student's attendance history.
* Faculty can edit/correct an attendance record.
* Attendance percentage changes after a correction.
* Students below 75% attendance are identified.
* Exactly 75% is not classified as low attendance.
* Invalid data is rejected.
* Empty/no-data states are handled.
* Frontend communicates with the Express backend through REST APIs.
* All data comes from MongoDB rather than hardcoded application data.
* The application can be demonstrated using seed/sample data.

---

# 32. Important Instruction for AI-Assisted Development

You are an implementation assistant for this PRD.

Follow this PRD as the source of truth.

Do not invent additional business requirements.

If an implementation detail is not specified:

1. Choose the simplest reasonable implementation.
2. Do not introduce a new user-facing feature.
3. Do not expand the project scope.
4. Keep the implementation aligned with the stated attendance workflow.

Before implementing a feature, verify that it belongs to the requirements above.

Focus primarily on:

* Correct business logic
* Correct database relationships
* Correct REST APIs
* Data validation
* Attendance calculations
* Attendance correction
* Low-attendance identification
* Functional frontend/backend integration

Keep the UI simple.

Do not spend significant development effort on visual polish.

The final result should be a working, understandable assessment project that can be explained clearly by the developer during a technical evaluation.
