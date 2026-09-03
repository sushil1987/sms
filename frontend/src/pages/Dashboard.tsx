import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, GraduationCap, Layers, CalendarCheck, DollarSign, Megaphone } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Badge from '../components/ui/Badge';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

const COLORS = ['#6366f1', '#818cf8', '#10b981', '#0ea5e9', '#f59e0b', '#f472b6'];

interface Analytics {
  attendance_trend: { date: string; present: number; absent: number }[];
  enrollment_by_class: { name: string; count: number }[];
  grade_distribution: { grade_letter: string; count: number }[];
  fee_monthly: { month: string; total: number }[];
  fee_summary: { total_collected: number; this_month: number; pending: number };
  recent_announcements: { id: number; title: string; priority: string; published_at: string }[];
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
  });

  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => (await api.get<Analytics>('/dashboard/analytics')).data,
  });

  const attendanceData = analytics?.attendance_trend?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    present: d.present,
    absent: d.absent,
  })) ?? [];

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle={stats?.current_academic_year ? `Academic Year ${stats.current_academic_year.name}` : 'Overview of your school'}
      />

      <div className="stat-grid">
        <StatCard title="Students" value={stats?.students ?? 0} icon={Users} color="indigo" />
        <StatCard title="Teachers" value={stats?.teachers ?? 0} icon={GraduationCap} color="emerald" />
        <StatCard title="Classes" value={stats?.classes ?? 0} icon={Layers} color="sky" />
        <StatCard title="Attendance Today" value={stats?.attendance_today ?? 0} icon={CalendarCheck} color="amber" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Attendance Trend" subtitle="Last 14 days" className="chart-grid-full">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="present" stroke="#6366f1" fill="url(#presentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="rgba(239,68,68,0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Enrollment by Class" subtitle="Active students">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.enrollment_by_class ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grade Distribution" subtitle="All exam results">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics?.grade_distribution ?? []}
                dataKey="count"
                nameKey="grade_letter"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {(analytics?.grade_distribution ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fee Collection" subtitle="Monthly revenue">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.fee_monthly ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="stat-grid" style={{ marginTop: '1.25rem' }}>
        <StatCard title="Total Collected" value={`$${Number(analytics?.fee_summary?.total_collected ?? 0).toLocaleString()}`} icon={DollarSign} color="emerald" />
        <StatCard title="This Month" value={`$${Number(analytics?.fee_summary?.this_month ?? 0).toLocaleString()}`} icon={DollarSign} color="sky" />
      </div>

      {analytics?.recent_announcements && analytics.recent_announcements.length > 0 && (
        <ChartCard title="Recent Announcements" subtitle="Latest published" className="chart-grid-full" >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.recent_announcements.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <Megaphone size={18} color="#818cf8" />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.title}</strong>
                </div>
                <Badge variant={a.priority === 'high' || a.priority === 'urgent' ? 'warning' : 'default'}>{a.priority}</Badge>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
