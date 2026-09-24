import Attendance from '../models/Attendance.js';

export function summarizeAttendance(records) {
  const total = records.length;
  const present = records.filter((record) => record.status === 'PRESENT').length;
  const absent = total - present;
  return {
    total,
    present,
    absent,
    percentage: total ? Number(((present / total) * 100).toFixed(2)) : null
  };
}

export async function getStudentSummaries(studentIds, subjectId) {
  const query = { studentId: { $in: studentIds } };
  if (subjectId) query.subjectId = subjectId;
  const records = await Attendance.find(query).populate('subjectId', 'name code').lean();
  return studentIds.map((studentId) => {
    const studentRecords = records.filter((record) => String(record.studentId) === String(studentId));
    return { studentId, ...summarizeAttendance(studentRecords) };
  });
}
