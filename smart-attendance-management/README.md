# Smart Attendance Management

A focused college attendance management system for faculty members. The application provides a complete workflow for recording, reviewing, correcting, and analysing student attendance.

The project is built as a JavaScript full-stack application with a React frontend, an Express REST API, and MongoDB persistence through Mongoose.

## Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Demo Login](#demo-login)
- [Loading and Managing Data](#loading-and-managing-data)
- [Attendance Rules](#attendance-rules)
- [REST API](#rest-api)
- [Validation and Error Handling](#validation-and-error-handling)
- [Troubleshooting](#troubleshooting)

## Project Overview

Smart Attendance Management is a faculty-only web application designed for colleges with departments, sections, subjects, and large student populations.

Faculty members can:

- Sign in to the application.
- View and search students.
- Add students to valid departments and sections.
- Record daily attendance for a selected class and subject.
- Review attendance records using filters.
- Correct an existing attendance record without creating a duplicate.
- View a student's subject-wise attendance history.
- Identify students whose attendance is below the 75% threshold.

The application keeps attendance calculations derived from attendance records. Attendance percentages are never stored as manually maintained student fields.

## Features

### Faculty Authentication

- Simple faculty login using email and password.
- Invalid credentials return a clear error message.
- The prototype uses one faculty role, as required by the product scope.

### Student Management

- Student list with roll number, name, email, department, and section.
- Search by student name or roll number.
- Add a student with required-field validation.
- Duplicate roll numbers are rejected.
- Department and section references are validated by the backend.

### Attendance Recording

- Select department, section, subject, and date.
- Load all students in the selected section.
- Mark each student as `PRESENT` or `ABSENT`.
- Save attendance records to MongoDB.
- Saving the same student, subject, and date updates the existing record instead of inserting a duplicate.

### Attendance Review and Correction

- Filter records by department, section, subject, and date.
- View the student, subject, date, status, and faculty member.
- Change a status directly from the review page.
- Corrections update the original MongoDB document.

### Attendance History

- Select a student to view their attendance history.
- View subject-level totals, present count, absent count, and percentage.
- View the underlying dated attendance records.

### Low Attendance Identification

- View students below 75% attendance.
- Filter by department, section, and optionally subject.
- Exactly 75% is treated as acceptable and is not included.
- Students without attendance records are excluded from the low-attendance list.

## Technology Stack

### Frontend

- React 18
- JavaScript
- Vite
- Bootstrap 5
- React Router dependency is available for future route expansion

### Backend

- Node.js
- Express.js
- REST API
- JSON request and response format
- CORS and dotenv

### Database

- MongoDB
- Mongoose
- Compound uniqueness index on `studentId`, `subjectId`, and `date`

## Project Structure

```text
smart-attendance-management/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Department.js
│   │   ├── Section.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   └── User.js
│   ├── services/
│   │   └── attendanceService.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
└── PRD.md
```

## Prerequisites

Install the following before starting:

- Node.js 18 or newer
- npm
- MongoDB Community Server or MongoDB Atlas
- Git, if cloning the project from a repository

Verify Node.js and npm:

```bash
node --version
npm --version
```

The default local MongoDB connection expects MongoDB to be available at:

```text
mongodb://127.0.0.1:27017
```

## Installation

Run all commands from the project root, the directory containing the root `package.json`.

### 1. Install root dependencies

```bash
npm install
```

### 2. Install backend and frontend dependencies

```bash
npm run install:all
```

This installs dependencies in both `backend/node_modules` and `frontend/node_modules`.

### 3. Configure the backend

Create a backend environment file from the supplied example:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item backend/.env.example backend/.env
```

## Configuration

The backend reads these values from `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/smart_attendance
```

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Port used by the Express API | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/smart_attendance` |

Port `5001` is used because macOS commonly reserves port `5000` for AirPlay. The frontend expects the API at `http://localhost:5001/api` by default. To use another API URL, start Vite with a `VITE_API_URL` environment variable:

```bash
VITE_API_URL=http://localhost:7000/api npm run dev --prefix frontend
```

## Running the Application

### Recommended: run backend and frontend together

Make sure MongoDB is running, then execute:

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

Open [http://localhost:5173](http://localhost:5173) in a browser.

### Run the backend separately

```bash
npm run dev --prefix backend
```

For a non-watch production-style start:

```bash
npm start --prefix backend
```

### Run the frontend separately

```bash
npm run dev --prefix frontend
```

Build the frontend for production:

```bash
npm run build --prefix frontend
```

Preview the production build locally:

```bash
npm run preview --prefix frontend
```

## Demo Login

After loading the seed data, use:

```text
Email:    faculty@example.com
Password: password
```

## Loading and Managing Data

### Load the demonstration dataset

The seed script creates:

- One demo faculty account
- CSE and ECE departments
- CSE-A, CSE-B, and ECE-A sections
- Three CSE subjects
- Six demonstration students
- Attendance records showing high attendance, exactly 75% attendance, and attendance below 75%

Run it from the project root:

```bash
npm run seed
```

The equivalent backend command is:

```bash
npm run seed --prefix backend
```

**Important:** the seed script clears the existing users, departments, sections, subjects, students, and attendance records in the configured database before inserting demo data. Use it only when resetting a development or assessment database.

### Add data through the application

After signing in:

1. Open **Students**.
2. Select **Add student**.
3. Enter a unique roll number, name, email, department, and section.
4. Save the student.
5. Open **Mark Attendance**.
6. Select the department, section, subject, and date.
7. Load the class roster.
8. Set each student to `Present` or `Absent`.
9. Select **Save attendance**.

Departments, sections, and subjects are currently intended to be supplied through the REST API or seed data. The backend exposes creation endpoints for those entities for development and integration use.

## Attendance Rules

The backend enforces the following business rules:

```text
Attendance status: PRESENT or ABSENT only
Attendance percentage: present records / total records * 100
Low attendance: percentage strictly below 75%
Exactly 75%: not low attendance
Duplicate key: one student + one subject + one date
Correction: update the existing attendance record
No attendance: percentage is reported as no data
```

Attendance dates are stored as date values, and attendance records use a MongoDB compound unique index to protect against duplicates at the database level.

## REST API

The backend base URL is `http://localhost:5001/api`.

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Authenticate a faculty user |

### Academic data

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/departments` | List departments |
| `POST` | `/departments` | Create a department |
| `GET` | `/sections` | List sections, optionally by `departmentId` |
| `POST` | `/sections` | Create a section |
| `GET` | `/subjects` | List subjects, optionally by `departmentId` |
| `POST` | `/subjects` | Create a subject |
| `GET` | `/students` | List and search students |
| `POST` | `/students` | Create a student |

### Attendance

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/attendance` | Create or update attendance for a class date |
| `GET` | `/attendance` | Review attendance records and filter results |
| `PUT` | `/attendance/:id` | Correct one attendance record |
| `GET` | `/attendance/student/:studentId` | View a student's history and summaries |
| `GET` | `/attendance/low` | Find students below 75% |
| `GET` | `/dashboard` | Retrieve dashboard counts |
| `GET` | `/health` | Check API availability |

Common query filters include `departmentId`, `sectionId`, `subjectId`, `studentId`, `date`, and `search`, depending on the endpoint.

## Validation and Error Handling

The API uses standard HTTP status codes:

- `200` for successful reads and updates
- `201` for successful creation
- `400` for invalid request data or references
- `401` for invalid login credentials
- `404` when a requested record does not exist
- `409` for duplicate unique records
- `500` for unexpected server errors

The frontend displays user-friendly messages instead of raw server stack traces.

## Troubleshooting

### Invalid email or password

The demo user only exists after seeding. Run:

```bash
npm run seed
```

Then use the credentials in the [Demo Login](#demo-login) section.

### `EADDRINUSE: address already in use`

Another process is using the configured API port. Check port `5001`:

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

If the existing process is the attendance backend, use it rather than starting a second copy. Verify it with:

```bash
curl http://localhost:5001/api/health
```

Expected response:

```json
{"status":"ok"}
```

### MongoDB connection failure

Confirm that MongoDB is running and that `MONGODB_URI` in `backend/.env` is correct. The backend must connect to MongoDB before it starts listening for API requests.

### Frontend cannot reach the API

Check that the backend is running on port `5001`. If the API uses a different URL, set `VITE_API_URL` before starting the frontend:

```bash
VITE_API_URL=http://localhost:7000/api npm run dev --prefix frontend
```

### Port or dependency changes are not reflected

Stop the running development processes and restart them after changing `.env` or package configuration. Vite reads environment variables when it starts.

## Development Notes

- This is a focused prototype for the requirements in `PRD.md`.
- The application intentionally has one faculty user type.
- Passwords are stored as plain text for this assessment prototype; production deployments should use password hashing and session or token-based authentication.
- The seed script is for development and demonstration only.
