import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const role = user?.role?.slug;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>SMS</h1>
          <p>School Management</p>
        </div>
        <nav>
          {role === 'admin' && (
            <>
              <NavLink to="/" end>Dashboard</NavLink>
              <NavLink to="/students">Students</NavLink>
              <NavLink to="/teachers">Teachers</NavLink>
              <NavLink to="/classes">Classes</NavLink>
              <NavLink to="/subjects">Subjects</NavLink>
              <NavLink to="/enrollments">Enrollments</NavLink>
              <NavLink to="/attendance">Attendance</NavLink>
              <NavLink to="/grades">Grades</NavLink>
              <NavLink to="/timetable">Timetable</NavLink>
            </>
          )}
          {role === 'teacher' && (
            <>
              <NavLink to="/" end>My Portal</NavLink>
              <NavLink to="/attendance">Attendance</NavLink>
              <NavLink to="/grades">Grades</NavLink>
              <NavLink to="/timetable">Timetable</NavLink>
            </>
          )}
          {role === 'student' && (
            <>
              <NavLink to="/" end>My Dashboard</NavLink>
              <NavLink to="/timetable">Timetable</NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <small>{user?.role?.name}</small>
          <button type="button" onClick={() => logout()}>Logout</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
