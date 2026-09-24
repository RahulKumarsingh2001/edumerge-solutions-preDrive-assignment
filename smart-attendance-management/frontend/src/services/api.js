const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  dashboard: () => request('/dashboard'),
  departments: () => request('/departments'),
  sections: (departmentId) => request(`/sections${departmentId ? `?departmentId=${departmentId}` : ''}`),
  subjects: (departmentId) => request(`/subjects${departmentId ? `?departmentId=${departmentId}` : ''}`),
  students: (params = {}) => request(`/students?${new URLSearchParams(params)}`),
  addStudent: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
  attendance: (params = {}) => request(`/attendance?${new URLSearchParams(params)}`),
  saveAttendance: (body) => request('/attendance', { method: 'POST', body: JSON.stringify(body) }),
  updateAttendance: (id, status) => request(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  studentHistory: (studentId) => request(`/attendance/student/${studentId}`),
  lowAttendance: (params = {}) => request(`/attendance/low?${new URLSearchParams(params)}`)
};
