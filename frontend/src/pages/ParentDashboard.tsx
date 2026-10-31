import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { User, CalendarCheck, Award, DollarSign, Clock } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';
import './ParentDashboard.css';

interface ChildSummary {
  student: { id: number; user: { name: string }; admission_number: string };
  enrollment?: { class_section: { name: string } };
  attendance_rate: number | null;
  average_grade: number | null;
  fees_paid: number;
}

interface ParentDashboardData {
  children: ChildSummary[];
}

interface ChildDetail {
  student: { id: number; user: { name: string } };
  chart?: { day: string; present: number; absent: number }[];
  grades?: { subject: { name: string }; exam_type: string; score: number; max_score: number; grade_letter: string }[];
  gradeChart?: { subject: string; average: number }[];
  total_paid?: number;
  payments?: { fee_structure: { name: string }; amount_paid: number; payment_date: string; receipt_number: string }[];
  timetable?: Record<string, { subject: { name: string }; start_time: string; end_time: string; teacher?: { name: string } }[]>;
  class?: { name: string };
}

export default function ParentDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'grades' | 'fees' | 'timetable'>('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['parent-dashboard'],
    queryFn: async () => (await api.get<ParentDashboardData>('/parent/dashboard')).data,
  });

  const children = data?.children ?? [];
  const selectedChild = children.find((c) => c.student.id === selectedChildId) ?? children[0];
  const childId = selectedChild?.student.id;

  const { data: attendanceData } = useQuery({
    queryKey: ['parent-child-attendance', childId],
    queryFn: async () => (await api.get<ChildDetail>(`/parent/children/${childId}/attendance`)).data,
    enabled: !!childId && activeTab === 'attendance',
  });

  const { data: gradesData } = useQuery({
    queryKey: ['parent-child-grades', childId],
    queryFn: async () => (await api.get<ChildDetail>(`/parent/children/${childId}/grades`)).data,
    enabled: !!childId && activeTab === 'grades',
  });

  const { data: feesData } = useQuery({
    queryKey: ['parent-child-fees', childId],
    queryFn: async () => (await api.get<ChildDetail>(`/parent/children/${childId}/fees`)).data,
    enabled: !!childId && activeTab === 'fees',
  });

  const { data: timetableData } = useQuery({
    queryKey: ['parent-child-timetable', childId],
    queryFn: async () => (await api.get<ChildDetail>(`/parent/children/${childId}/timetable`)).data,
    enabled: !!childId && activeTab === 'timetable',
  });

  if (isLoading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  return (
    <div>
      <PageHeader title="Parent Portal" subtitle="Track your children's academic progress" />

      {children.length > 1 && (
        <div className="child-selector">
          {children.map((c) => (
            <button
              key={c.student.id}
              type="button"
              className={selectedChild?.student.id === c.student.id ? 'active' : ''}
              onClick={() => { setSelectedChildId(c.student.id); setActiveTab('overview'); }}
            >
              {c.student.user.name}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          <div className="stat-grid">
            <StatCard title="Child" value={selectedChild.student.user.name} icon={User} color="indigo" />
            <StatCard title="Attendance" value={selectedChild.attendance_rate != null ? `${selectedChild.attendance_rate}%` : '—'} icon={CalendarCheck} color="emerald" />
            <StatCard title="Avg Grade" value={selectedChild.average_grade != null ? `${selectedChild.average_grade}%` : '—'} icon={Award} color="sky" />
            <StatCard title="Fees Paid" value={`$${Number(selectedChild.fees_paid).toLocaleString()}`} icon={DollarSign} color="amber" />
          </div>

          <div className="tabs">
            {(['overview', 'attendance', 'grades', 'fees', 'timetable'] as const).map((tab) => (
              <button key={tab} type="button" className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="chart-grid">
              <ChartCard title="Class" subtitle="Current enrollment">
                <div style={{ padding: '1rem 0' }}>
                  <Badge variant="info">{selectedChild.enrollment?.class_section.name ?? 'Not enrolled'}</Badge>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
                    Admission: {selectedChild.student.admission_number}
                  </p>
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => setActiveTab('attendance')}>View Attendance</Button>
                    <Button variant="primary" onClick={() => setActiveTab('grades')}>View Grades</Button>
                  </div>
                </div>
              </ChartCard>
              <ChartCard title="Quick Stats" subtitle="At a glance">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Attendance Rate</span>
                    <strong style={{ color: '#34d399' }}>{selectedChild.attendance_rate ?? 0}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Average Grade</span>
                    <strong style={{ color: '#818cf8' }}>{selectedChild.average_grade ?? 0}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Fees Paid</span>
                    <strong style={{ color: '#fbbf24' }}>${Number(selectedChild.fees_paid).toLocaleString()}</strong>
                  </div>
                </div>
              </ChartCard>
            </div>
          )}

          {activeTab === 'attendance' && attendanceData?.chart && (
            <ChartCard title="Attendance — Last 30 Days" subtitle={selectedChild.student.user.name}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={attendanceData.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="present" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="rgba(239,68,68,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {activeTab === 'grades' && gradesData?.gradeChart && (
            <ChartCard title="Subject Performance" subtitle={selectedChild.student.user.name}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gradesData.gradeChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
                  <Bar dataKey="average" fill="#818cf8" radius={[6, 6, 0, 0]} name="Avg %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {activeTab === 'fees' && feesData && (
            <ChartCard title="Fee Payments" subtitle={`Total: $${Number(feesData.total_paid).toLocaleString()}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {feesData.payments?.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.fee_structure.name}</strong>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{p.receipt_number}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#34d399' }}>${Number(p.amount_paid).toLocaleString()}</strong>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{new Date(p.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {activeTab === 'timetable' && timetableData?.timetable && (
            <ChartCard title={`Timetable — ${timetableData.class?.name ?? ''}`} subtitle={selectedChild.student.user.name}>
              {Object.entries(timetableData.timetable).map(([day, entries]) => (
                <div key={day} style={{ marginBottom: '1rem' }}>
                  <h4 style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{day}</h4>
                  {entries.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                      <Clock size={14} color="#64748b" />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', minWidth: 100 }}>
                        {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                      </span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1 }}>{entry.subject.name}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{entry.teacher?.name ?? ''}</span>
                    </div>
                  ))}
                </div>
              ))}
            </ChartCard>
          )}
        </>
      )}

      {children.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No children linked to your account.</p>
      )}
    </div>
  );
}
