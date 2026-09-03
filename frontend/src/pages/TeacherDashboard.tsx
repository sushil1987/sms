import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { BookOpen, Users, CalendarCheck, Award, Megaphone } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

interface TeacherData {
  classes: { id: number; name: string; grade_level: string; section: string }[];
  total_students: number;
  attendance_today: number;
  grades_recorded: number;
  attendance_trend: { date: string; rate: number }[];
  grade_averages: { subject: string; average: number }[];
  announcements: { id: number; title: string; priority: string }[];
}

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => (await api.get<TeacherData>('/teacher/dashboard')).data,
  });

  if (isLoading) return <p style={{ color: 'var(--text-muted)' }}>Loading portal...</p>;

  const trendData = data?.attendance_trend?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    rate: d.rate,
  })) ?? [];

  return (
    <div>
      <PageHeader title="Teacher Portal" subtitle="Manage your classes and track student progress" />

      <div className="stat-grid">
        <StatCard title="My Classes" value={data?.classes.length ?? 0} icon={BookOpen} color="indigo" />
        <StatCard title="Total Students" value={data?.total_students ?? 0} icon={Users} color="emerald" />
        <StatCard title="Attendance Today" value={data?.attendance_today ?? 0} icon={CalendarCheck} color="amber" />
        <StatCard title="Grades Recorded" value={data?.grades_recorded ?? 0} icon={Award} color="sky" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Attendance Rate" subtitle="Last 7 days — your classes">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#rateGrad)" strokeWidth={2} name="Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Class Averages" subtitle="By subject">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.grade_averages ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="average" fill="#6366f1" radius={[6, 6, 0, 0]} name="Avg %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h3 style={{ color: 'var(--text-primary)', margin: '1.5rem 0 1rem', fontSize: '1.125rem' }}>My Classes</h3>
      <div className="stat-grid">
        {data?.classes.map((cls) => (
          <div key={cls.id} className="form-card" style={{ marginBottom: 0 }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{cls.name}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              Grade {cls.grade_level} · Section {cls.section}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/attendance"><Button variant="secondary">Attendance</Button></Link>
              <Link to="/grades"><Button variant="primary">Grades</Button></Link>
            </div>
          </div>
        ))}
      </div>

      {data?.announcements && data.announcements.length > 0 && (
        <>
          <h3 style={{ color: 'var(--text-primary)', margin: '1.5rem 0 1rem', fontSize: '1.125rem' }}>Announcements</h3>
          {data.announcements.map((a) => (
            <div key={a.id} className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <Megaphone size={18} color="#818cf8" />
              <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.title}</span>
              <Badge variant={a.priority === 'high' ? 'warning' : 'default'}>{a.priority}</Badge>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
