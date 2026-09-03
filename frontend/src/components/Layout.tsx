import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Layers,
  ClipboardList, CalendarCheck, Award, Clock, Megaphone,
  DollarSign, FileText, ScrollText, Calendar, LogOut, School,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

const adminNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/teachers', icon: GraduationCap, label: 'Teachers' },
  { to: '/classes', icon: Layers, label: 'Classes' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/enrollments', icon: ClipboardList, label: 'Enrollments' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/grades', icon: Award, label: 'Grades' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
  { to: '/academic-years', icon: Calendar, label: 'Academic Years' },
  { to: '/fees', icon: DollarSign, label: 'Fees' },
  { to: '/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
];

const teacherNav = [
  { to: '/', icon: LayoutDashboard, label: 'My Portal', end: true },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/grades', icon: Award, label: 'Grades' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
];

const studentNav = [
  { to: '/', icon: LayoutDashboard, label: 'My Dashboard', end: true },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const role = user?.role?.slug;
  const nav = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><School size={24} /></div>
          <div>
            <h1>EduSphere</h1>
            <span>School Management</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info">
            <strong>{user?.name}</strong>
            <small>{user?.role?.name}</small>
          </div>
          <button type="button" className="logout-btn" onClick={() => logout()} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
