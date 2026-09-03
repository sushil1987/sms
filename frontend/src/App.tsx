import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Enrollments from './pages/Enrollments';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Timetable from './pages/Timetable';
import AcademicYears from './pages/AcademicYears';
import Fees from './pages/Fees';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import AuditLogs from './pages/AuditLogs';
import Schools from './pages/Schools';
import Library from './pages/Library';
import Transport from './pages/Transport';
import Hostel from './pages/Hostel';
import Reports from './pages/Reports';
import PrincipalDashboard from './pages/PrincipalDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleDashboard() {
  const role = useAuthStore((s) => s.user?.role?.slug);
  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'principal') return <PrincipalDashboard />;
  if (role === 'student') return <StudentDashboard />;
  if (role === 'parent') return <ParentDashboard />;
  return <Dashboard />;
}

function AppRoutes() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RoleDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="enrollments" element={<Enrollments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="grades" element={<Grades />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="academic-years" element={<AcademicYears />} />
        <Route path="fees" element={<Fees />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="documents" element={<Documents />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="schools" element={<Schools />} />
        <Route path="library" element={<Library />} />
        <Route path="transport" element={<Transport />} />
        <Route path="hostel" element={<Hostel />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
