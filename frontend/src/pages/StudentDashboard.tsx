import { useQuery } from '@tanstack/react-query';
import {
  RadialBarChart, RadialBar, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { User, CalendarCheck, Award, DollarSign, Megaphone } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

interface StudentData {
  student: { user: { name: string }; admission_number: string };
  enrollment?: { class_section: { name: string } };
  attendance_rate: number | null;
  attendance_chart: { day: string; status: number }[];
  grade_chart: { subject: string; percentage: number }[];
  fees_paid: number;
  recent_grades: { subject: { name: string }; exam_type: string; score: number; max_score: number; grade_letter: string }[];
  announcements: { id: number; title: string; body: string; priority: string }[];
}

export default function StudentDashboard() {
  const { data } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => (await api.get<StudentData>('/student/dashboard')).data,
  });

  const radialData = [{ name: 'Attendance', value: data?.attendance_rate ?? 0, fill: '#6366f1' }];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${data?.student.user.name ?? 'Student'}`}
        subtitle={data?.enrollment ? `Class: ${data.enrollment.class_section.name}` : undefined}
      />

      <div className="stat-grid">
        <StatCard title="Admission #" value={data?.student.admission_number ?? '—'} icon={User} color="indigo" />
        <StatCard title="Attendance" value={data?.attendance_rate != null ? `${data.attendance_rate}%` : '—'} icon={CalendarCheck} color="emerald" />
        <StatCard title="Grades" value={data?.recent_grades.length ?? 0} icon={Award} color="sky" />
        <StatCard title="Fees Paid" value={`$${Number(data?.fees_paid ?? 0).toLocaleString()}`} icon={DollarSign} color="amber" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Attendance Overview" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
              <RadialBar background dataKey="value" cornerRadius={10} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#f1f5f9" fontSize="24" fontWeight="700">
                {data?.attendance_rate ?? 0}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Subject Performance" subtitle="Exam scores">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.grade_chart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="percentage" fill="#818cf8" radius={[6, 6, 0, 0]} name="Score %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Recent Grades" subtitle="Latest exam results" className="chart-grid-full" >
        <DataTable
          columns={[
            { key: 'subject', header: 'Subject', render: (r) => r.subject.name },
            { key: 'exam', header: 'Exam', render: (r) => r.exam_type },
            { key: 'score', header: 'Score', render: (r) => `${r.score}/${r.max_score}` },
            { key: 'grade', header: 'Grade', render: (r) => <Badge variant="success">{r.grade_letter}</Badge> },
          ]}
          data={data?.recent_grades ?? []}
          keyField="exam_type"
          emptyMessage="No grades recorded yet."
        />
      </ChartCard>

      {data?.announcements && data.announcements.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.125rem' }}>Announcements</h3>
          {data.announcements.map((a) => (
            <div key={a.id} className="form-card" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Megaphone size={16} color="#818cf8" />
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{a.title}</strong>
                <Badge variant={a.priority === 'high' ? 'warning' : 'info'}>{a.priority}</Badge>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
