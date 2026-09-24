import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import Department from './models/Department.js';
import Section from './models/Section.js';
import Student from './models/Student.js';
import Subject from './models/Subject.js';
import Attendance from './models/Attendance.js';

await connectDatabase();
await Promise.all([Attendance.deleteMany(), Student.deleteMany(), Subject.deleteMany(), Section.deleteMany(), Department.deleteMany(), User.deleteMany()]);

const [faculty] = await User.create([{ name: 'Demo Faculty', email: 'faculty@example.com', password: 'password' }]);
const [cse, ece] = await Department.create([{ name: 'CSE' }, { name: 'ECE' }]);
const [cseA, cseB, eceA] = await Section.create([{ name: 'CSE-A', departmentId: cse._id }, { name: 'CSE-B', departmentId: cse._id }, { name: 'ECE-A', departmentId: ece._id }]);
const [dataStructures, dbms, operatingSystems] = await Subject.create([
  { name: 'Data Structures', code: 'CS301', departmentId: cse._id },
  { name: 'Database Management Systems', code: 'CS302', departmentId: cse._id },
  { name: 'Operating Systems', code: 'CS303', departmentId: cse._id }
]);
const students = await Student.create([
  { rollNumber: 'CSE001', name: 'Rahul Kumar', email: 'rahul@example.com', departmentId: cse._id, sectionId: cseA._id },
  { rollNumber: 'CSE002', name: 'Amit Kumar', email: 'amit@example.com', departmentId: cse._id, sectionId: cseA._id },
  { rollNumber: 'CSE003', name: 'Priya Singh', email: 'priya@example.com', departmentId: cse._id, sectionId: cseA._id },
  { rollNumber: 'CSE004', name: 'Neha Sharma', email: 'neha@example.com', departmentId: cse._id, sectionId: cseA._id },
  { rollNumber: 'CSE005', name: 'Arjun Mehta', email: 'arjun@example.com', departmentId: cse._id, sectionId: cseB._id },
  { rollNumber: 'ECE001', name: 'Isha Patel', email: 'isha@example.com', departmentId: ece._id, sectionId: eceA._id }
]);

const dates = ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-08'];
const statusSets = [['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT'], ['PRESENT', 'ABSENT', 'ABSENT', 'ABSENT'], ['PRESENT', 'PRESENT', 'ABSENT', 'ABSENT'], ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT']];
const attendance = [];
students.slice(0, 4).forEach((student, studentIndex) => dates.forEach((date, dateIndex) => attendance.push({ studentId: student._id, subjectId: dataStructures._id, facultyId: faculty._id, date: new Date(`${date}T00:00:00.000Z`), status: statusSets[studentIndex][dateIndex] })));
await Attendance.insertMany(attendance);

console.log(`Seeded ${students.length} students and ${attendance.length} attendance records.`);
await mongoose.disconnect();
