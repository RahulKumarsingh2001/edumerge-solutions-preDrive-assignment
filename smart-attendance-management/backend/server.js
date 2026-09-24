import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import Department from './models/Department.js';
import Section from './models/Section.js';
import Student from './models/Student.js';
import Subject from './models/Subject.js';
import Attendance from './models/Attendance.js';
import { getStudentSummaries, summarizeAttendance } from './services/attendanceService.js';

const app = express();
app.use(cors());
app.use(express.json());

const asyncRoute = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
const isId = (value) => mongoose.Types.ObjectId.isValid(value);
const fail = (response, status, message) => response.status(status).json({ message });

app.get('/api/health', (request, response) => response.json({ status: 'ok' }));

app.post('/api/auth/login', asyncRoute(async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email: email?.toLowerCase(), password }).select('-password');
  if (!user) return fail(response, 401, 'Invalid email or password.');
  return response.json({ user });
}));

app.get('/api/departments', asyncRoute(async (request, response) => response.json(await Department.find().sort('name'))));
app.post('/api/departments', asyncRoute(async (request, response) => response.status(201).json(await Department.create(request.body))));
app.get('/api/sections', asyncRoute(async (request, response) => {
  const query = request.query.departmentId ? { departmentId: request.query.departmentId } : {};
  response.json(await Section.find(query).populate('departmentId', 'name').sort('name'));
}));
app.post('/api/sections', asyncRoute(async (request, response) => response.status(201).json(await Section.create(request.body))));
app.get('/api/subjects', asyncRoute(async (request, response) => {
  const query = request.query.departmentId ? { departmentId: request.query.departmentId } : {};
  response.json(await Subject.find(query).populate('departmentId', 'name').sort('name'));
}));
app.post('/api/subjects', asyncRoute(async (request, response) => response.status(201).json(await Subject.create(request.body))));

app.get('/api/students', asyncRoute(async (request, response) => {
  const query = {};
  if (request.query.departmentId) query.departmentId = request.query.departmentId;
  if (request.query.sectionId) query.sectionId = request.query.sectionId;
  if (request.query.search) query.$or = [
    { name: { $regex: request.query.search, $options: 'i' } },
    { rollNumber: { $regex: request.query.search, $options: 'i' } }
  ];
  response.json(await Student.find(query).populate('departmentId', 'name').populate('sectionId', 'name').sort('rollNumber'));
}));
app.post('/api/students', asyncRoute(async (request, response) => {
  const { departmentId, sectionId } = request.body;
  if (!isId(departmentId) || !isId(sectionId) || !(await Department.exists({ _id: departmentId })) || !(await Section.exists({ _id: sectionId, departmentId }))) {
    return fail(response, 400, 'Student must reference a valid department and section.');
  }
  return response.status(201).json(await Student.create(request.body));
}));

app.get('/api/attendance', asyncRoute(async (request, response) => {
  const query = {};
  if (request.query.subjectId) query.subjectId = request.query.subjectId;
  if (request.query.studentId) query.studentId = request.query.studentId;
  if (request.query.date) query.date = new Date(`${request.query.date}T00:00:00.000Z`);
  const records = await Attendance.find(query).populate({ path: 'studentId', populate: [{ path: 'departmentId', select: 'name' }, { path: 'sectionId', select: 'name' }] }).populate('subjectId', 'name code').populate('facultyId', 'name').sort('-date studentId');
  const filtered = request.query.departmentId || request.query.sectionId
    ? records.filter((record) => (!request.query.departmentId || String(record.studentId.departmentId?._id) === request.query.departmentId) && (!request.query.sectionId || String(record.studentId.sectionId?._id) === request.query.sectionId))
    : records;
  response.json(filtered);
}));

app.post('/api/attendance', asyncRoute(async (request, response) => {
  const { subjectId, facultyId, date, records } = request.body;
  if (!isId(subjectId) || !isId(facultyId) || !date || !Array.isArray(records) || !records.length) return fail(response, 400, 'Subject, faculty, date, and attendance records are required.');
  if (!(await Subject.exists({ _id: subjectId })) || !(await User.exists({ _id: facultyId }))) return fail(response, 400, 'Invalid subject or faculty reference.');
  if (records.some((record) => !isId(record.studentId) || !['PRESENT', 'ABSENT'].includes(record.status))) return fail(response, 400, 'Every record needs a valid student and status.');
  const studentIds = records.map((record) => record.studentId);
  if ((await Student.countDocuments({ _id: { $in: studentIds } })) !== studentIds.length) return fail(response, 400, 'One or more students are invalid.');
  const operations = records.map((record) => ({ updateOne: { filter: { studentId: record.studentId, subjectId, date: new Date(date) }, update: { $set: { facultyId, status: record.status } }, upsert: true } }));
  await Attendance.bulkWrite(operations);
  response.status(201).json({ message: 'Attendance saved successfully.' });
}));

app.put('/api/attendance/:id', asyncRoute(async (request, response) => {
  if (!isId(request.params.id) || !['PRESENT', 'ABSENT'].includes(request.body.status)) return fail(response, 400, 'A valid attendance ID and status are required.');
  const record = await Attendance.findByIdAndUpdate(request.params.id, { status: request.body.status }, { new: true }).populate('studentId subjectId facultyId');
  if (!record) return fail(response, 404, 'Attendance record not found.');
  response.json(record);
}));

app.get('/api/attendance/student/:studentId', asyncRoute(async (request, response) => {
  if (!isId(request.params.studentId)) return fail(response, 400, 'Invalid student ID.');
  const records = await Attendance.find({ studentId: request.params.studentId }).populate('subjectId', 'name code').sort('-date');
  const bySubject = new Map();
  records.forEach((record) => {
    const key = String(record.subjectId._id);
    if (!bySubject.has(key)) bySubject.set(key, { subject: record.subjectId, records: [] });
    bySubject.get(key).records.push(record);
  });
  response.json({ records, summaries: [...bySubject.values()].map((entry) => ({ subject: entry.subject, ...summarizeAttendance(entry.records) })) });
}));

app.get('/api/attendance/low', asyncRoute(async (request, response) => {
  const studentQuery = {};
  if (request.query.departmentId) studentQuery.departmentId = request.query.departmentId;
  if (request.query.sectionId) studentQuery.sectionId = request.query.sectionId;
  const students = await Student.find(studentQuery).populate('departmentId', 'name').populate('sectionId', 'name').sort('rollNumber');
  const summaries = await getStudentSummaries(students.map((student) => student._id), request.query.subjectId);
  response.json(students.map((student, index) => ({ student, ...summaries[index] })).filter((entry) => entry.percentage !== null && entry.percentage < 75));
}));

app.get('/api/dashboard', asyncRoute(async (request, response) => {
  const [students, subjects, today] = await Promise.all([Student.countDocuments(), Subject.countDocuments(), Attendance.countDocuments({ date: new Date(new Date().toISOString().slice(0, 10)) })]);
  const allStudents = await Student.find({}, '_id');
  const summaries = await getStudentSummaries(allStudents.map((student) => student._id));
  response.json({ students, subjects, todayAttendance: today, lowAttendance: summaries.filter((summary) => summary.percentage !== null && summary.percentage < 75).length });
}));

app.use((error, request, response, next) => {
  if (error.code === 11000) return fail(response, 409, 'A record with the same unique value already exists.');
  if (error.name === 'ValidationError') return fail(response, 400, 'Please check the submitted values.');
  console.error(error);
  return fail(response, 500, 'An unexpected server error occurred.');
});

const port = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'test') connectDatabase().then(() => app.listen(port, () => console.log(`API listening on port ${port}`))).catch((error) => { console.error(error); process.exit(1); });
export default app;
