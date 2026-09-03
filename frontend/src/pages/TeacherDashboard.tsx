import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { ClassSection } from '../types';
import './Dashboard.css';

interface TeacherDashboardData {
  classes: ClassSection[];
  total_students: number;
  attendance_today: number;
  grades_recorded: number;
}

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => (await api.get<TeacherDashboardData>('/teacher/dashboard')).data,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <header>
        <h1>Teacher Portal</h1>
      </header>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>My Classes</h3>
          <p>{data?.classes.length ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{data?.total_students ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Attendance Today</h3>
          <p>{data?.attendance_today ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Grades Recorded</h3>
          <p>{data?.grades_recorded ?? 0}</p>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem', color: '#0f172a' }}>My Classes</h2>
      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        {data?.classes.map((cls) => (
          <div key={cls.id} className="stat-card">
            <h3>{cls.name}</h3>
            <p style={{ fontSize: '1rem', fontWeight: 400 }}>Grade {cls.grade_level} · Section {cls.section}</p>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/attendance" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>Attendance</Link>
              <Link to="/grades" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>Grades</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
