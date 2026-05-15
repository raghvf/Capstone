import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import Front from './frontpage';
import Signin from './signin';
import Addstudent from './Addstudent';
import Enrolled from './Enrolled';
import Period from './period';
import Dashboard from './dashboard';

import AdminOverview from './pages/admin/AdminOverview';
import AdminStudents from './pages/admin/AdminStudents';
import { AdminTeachers, AdminDepartments, AdminClasses, AdminSchedules, AdminAttendance, AdminRecognition } from './pages/admin/AdminGeneric';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import { TeacherClasses, TeacherAssignments, TeacherAnnouncements, TeacherReports } from './pages/teacher/TeacherGeneric';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import { StudentSchedule, StudentAssignments, StudentAnnouncements, StudentProfile } from './pages/student/StudentGeneric';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Front />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/Signin" element={<Signin />} />

          {/* Legacy admin routes (preserved) */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/Addstudent" element={<ProtectedRoute roles={['admin']}><Addstudent /></ProtectedRoute>} />
          <Route path="/Enrolled" element={<ProtectedRoute roles={['admin']}><Enrolled /></ProtectedRoute>} />
          <Route path="/Period" element={<ProtectedRoute roles={['admin', 'teacher']}><Period /></ProtectedRoute>} />

          {/* Admin panel */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute roles={['admin']}><AdminTeachers /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute roles={['admin']}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute roles={['admin']}><AdminClasses /></ProtectedRoute>} />
          <Route path="/admin/schedules" element={<ProtectedRoute roles={['admin']}><AdminSchedules /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/recognition" element={<ProtectedRoute roles={['admin']}><AdminRecognition /></ProtectedRoute>} />

          {/* Teacher panel */}
          <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/classes" element={<ProtectedRoute roles={['teacher']}><TeacherClasses /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute roles={['teacher']}><TeacherAttendance /></ProtectedRoute>} />
          <Route path="/teacher/reports" element={<ProtectedRoute roles={['teacher']}><TeacherReports /></ProtectedRoute>} />
          <Route path="/teacher/assignments" element={<ProtectedRoute roles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
          <Route path="/teacher/announcements" element={<ProtectedRoute roles={['teacher']}><TeacherAnnouncements /></ProtectedRoute>} />

          {/* Student panel */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/schedule" element={<ProtectedRoute roles={['student']}><StudentSchedule /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/announcements" element={<ProtectedRoute roles={['student']}><StudentAnnouncements /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
