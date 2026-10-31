import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GraduationCap, Layers, AlertCircle, Clock, Megaphone } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

interface PrincipalData {
  teachers: number;
  classes: number;
  unassigned_classes: number;
  timetable_entries: number;
  teachers_by_department: { department: string; count: number }[];
  class_assignments: { id: number; name: string; grade_level: string; class_teacher: string | null; academic_year: string }[];
  announcements: { id: number; title: string; priority: string }[];
}

export default function PrincipalDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['principal-dashboard'],
    queryFn: async () => (await api.get<PrincipalData>('/principal/dashboard')).data,
  });

  if (isLoading) return <p style={{ color: 'var(--text-muted)' }}>Loading portal...</p>;

  return (
    <div>
      <PageHeader
        title="Principal Portal"
        subtitle="Manage teachers, assign class teachers, and oversee academic staffing"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/teachers"><Button variant="secondary">Manage Teachers</Button></Link>
            <Link to="/classes"><Button>Assign Classes</Button></Link>
          </div>
        }
      />

      <div className="stat-grid">
        <StatCard title="Teachers" value={data?.teachers ?? 0} icon={GraduationCap} color="indigo" />
        <StatCard title="Classes" value={data?.classes ?? 0} icon={Layers} color="emerald" />
        <StatCard title="Unassigned Classes" value={data?.unassigned_classes ?? 0} icon={AlertCircle} color="amber" />
        <StatCard title="Timetable Entries" value={data?.timetable_entries ?? 0} icon={Clock} color="sky" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Teachers by Department">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.teachers_by_department ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Announcements">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.announcements?.length ? data.announcements.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={16} style={{ color: '#94a3b8' }} />
                <span style={{ flex: 1, fontSize: '0.875rem' }}>{a.title}</span>
                <Badge variant={a.priority === 'high' ? 'warning' : 'default'}>{a.priority}</Badge>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No announcements</p>}
          </div>
        </ChartCard>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <ChartCard title="Class Teacher Assignments" subtitle="Assign or update class teachers from the Classes page">
          <DataTable
            columns={[
              { key: 'name', header: 'Class' },
              { key: 'grade', header: 'Grade', render: (r) => String(r.grade_level) },
              { key: 'year', header: 'Year', render: (r) => String(r.academic_year ?? '—') },
              { key: 'teacher', header: 'Class Teacher', render: (r) => r.class_teacher
                ? <Badge variant="success">{String(r.class_teacher)}</Badge>
                : <Badge variant="warning">Unassigned</Badge> },
            ]}
            data={(data?.class_assignments ?? []) as unknown as Record<string, unknown>[]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
