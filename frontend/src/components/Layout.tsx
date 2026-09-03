import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Layers,
  ClipboardList, CalendarCheck, Award, Clock, Megaphone,
  DollarSign, FileText, ScrollText, Calendar, LogOut, School,
  Menu, X, Heart, Building2, Library, Bus, Home, BarChart3,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';
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
  { to: '/schools', icon: Building2, label: 'Schools' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/transport', icon: Bus, label: 'Transport' },
  { to: '/hostel', icon: Home, label: 'Hostel' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const principalNav = [
  { to: '/', icon: LayoutDashboard, label: 'Portal', end: true },
  { to: '/teachers', icon: GraduationCap, label: 'Teachers' },
  { to: '/classes', icon: Layers, label: 'Classes' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
];

const teacherNav = [
  { to: '/', icon: LayoutDashboard, label: 'Portal', end: true },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/grades', icon: Award, label: 'Grades' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
];

const studentNav = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/timetable', icon: Clock, label: 'Schedule' },
];

const parentNav = [
  { to: '/', icon: Heart, label: 'My Children', end: true },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role?.slug;

  const nav = role === 'admin' ? adminNav
    : role === 'principal' ? principalNav
    : role === 'teacher' ? teacherNav
    : role === 'parent' ? parentNav
    : studentNav;

  const mobileNav = nav.slice(0, 4);

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><School size={24} /></div>
          <div>
            <h1>EduSphere</h1>
            <span>School Management</span>
          </div>
          <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setSidebarOpen(false)}
            >
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

      <div className="main-wrapper">
        <header className="top-bar">
          <button type="button" className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="top-bar-title">
            <span className="top-bar-greeting">Welcome, {user?.name?.split(' ')[0]}</span>
            <small>{user?.role?.name}</small>
          </div>
          <NotificationBell />
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-bottom-nav">
        {mobileNav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}>
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
