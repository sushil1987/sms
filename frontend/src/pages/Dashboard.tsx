import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import './Dashboard.css';

interface DashboardStats {
  students: number;
  teachers: number;
  classes: number;
  attendance_today: number;
  current_academic_year: { name: string } | null;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/dashboard/stats');
      return data;
    },
  });

  if (isLoading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        {data?.current_academic_year && (
          <span className="badge">Academic Year: {data.current_academic_year.name}</span>
        )}
      </header>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Students</h3>
          <p>{data?.students ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Teachers</h3>
          <p>{data?.teachers ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Classes</h3>
          <p>{data?.classes ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Attendance Today</h3>
          <p>{data?.attendance_today ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
