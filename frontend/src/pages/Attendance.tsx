import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { ClassSection, PaginatedResponse } from '../types';
import PageHeader from '../components/ui/PageHeader';
import '../components/ui/DataTable.css';

interface AttendanceSheet {
  date: string;
  class_section_id: number;
  students: {
    student: { id: number; user: { name: string } };
    status?: string;
  }[];
}

interface AttendanceReport {
  report: {
    student: { user: { name: string } };
    total_days: number;
    present: number;
    absent: number;
    late: number;
    attendance_rate: number;
  }[];
}

export default function Attendance() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.slug === 'admin';
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'mark' | 'report'>('mark');
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');

  const classesEndpoint = isAdmin ? '/classes' : '/teacher/classes';

  const { data: classes } = useQuery({
    queryKey: ['attendance-classes', classesEndpoint],
    queryFn: async () => (await api.get<ClassSection[] | PaginatedResponse<ClassSection>>(classesEndpoint)).data,
  });

  const classList = Array.isArray(classes) ? classes : classes?.data ?? [];

  const { data: sheet, isLoading } = useQuery({
    queryKey: ['attendance-sheet', classId, date],
    queryFn: async () => (await api.get<AttendanceSheet>('/attendance/sheet', { params: { class_section_id: classId, date } })).data,
    enabled: !!classId && tab === 'mark',
  });

  const { data: report } = useQuery({
    queryKey: ['attendance-report', classId],
    queryFn: async () => (await api.get<AttendanceReport>('/attendance/report', { params: { class_section_id: classId } })).data,
    enabled: !!classId && tab === 'report',
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/attendance/bulk', {
      class_section_id: Number(classId),
      date,
      records: (sheet?.students ?? []).map((row) => ({
        student_id: row.student.id,
        status: statuses[row.student.id] ?? row.status ?? 'present',
      })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sheet'] });
      setMessage('Attendance saved successfully.');
    },
    onError: () => setMessage('Failed to save attendance.'),
  });

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark daily attendance and view reports" />

      <div className="tabs">
        <button type="button" className={tab === 'mark' ? 'active' : ''} onClick={() => setTab('mark')}>Mark Attendance</button>
        <button type="button" className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>Reports</button>
      </div>

      <div className="filters">
        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select class</option>
          {classList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {tab === 'mark' && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
      </div>

      {message && <div className="message success">{message}</div>}

      {tab === 'mark' && classId && (
        <>
          {isLoading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sheet?.students.map((row) => (
                  <tr key={row.student.id}>
                    <td>{row.student.user.name}</td>
                    <td>
                      <select
                        value={statuses[row.student.id] ?? row.status ?? 'present'}
                        onChange={(e) => setStatuses({ ...statuses, [row.student.id]: e.target.value })}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={saveMutation.isPending || !sheet?.students.length}
            onClick={() => { setMessage(''); saveMutation.mutate(); }}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </button>
        </>
      )}

      {tab === 'report' && classId && (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {report?.report.map((row, i) => (
              <tr key={i}>
                <td>{row.student.user.name}</td>
                <td>{row.present}</td>
                <td>{row.absent}</td>
                <td>{row.late}</td>
                <td>{row.attendance_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
