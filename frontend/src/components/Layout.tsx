import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>SMS</h1>
          <p>School Management</p>
        </div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          {user?.role?.slug === 'admin' && (
            <>
              <NavLink to="/students">Students</NavLink>
              <NavLink to="/teachers">Teachers</NavLink>
              <NavLink to="/classes">Classes</NavLink>
              <NavLink to="/subjects">Subjects</NavLink>
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
