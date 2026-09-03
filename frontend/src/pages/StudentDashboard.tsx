import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import './Dashboard.css';
import './ResourceList.css';

interface StudentDashboardData {
  student: { user: { name: string }; admission_number: string };
  enrollment?: { class_section: { name: string } };
  attendance_rate: number | null;
  recent_grades: { subject: { name: string }; exam_type: string; score: number; max_score: number; grade_letter: string }[];
}

interface TimetableData {
  class: { name: string };
  timetable: Record<string, { subject: { name: string }; start_time: string; end_time: string; teacher?: { name: string } }[]>;
}

export default function StudentDashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => (await api.get<StudentDashboardData>('/student/dashboard')).data,
  });

  const { data: timetable } = useQuery({
    queryKey: ['student-timetable'],
    queryFn: async () => (await api.get<TimetableData>('/student/timetable')).data,
  });

  return (
    <div className="dashboard">
      <header>
        <h1>My Dashboard</h1>
        {dashboard?.enrollment && (
          <span className="badge">{dashboard.enrollment.class_section.name}</span>
        )}
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Admission #</h3>
          <p style={{ fontSize: '1.25rem' }}>{dashboard?.student.admission_number}</p>
        </div>
        <div className="stat-card">
          <h3>Attendance Rate</h3>
          <p>{dashboard?.attendance_rate != null ? `${dashboard.attendance_rate}%` : '—'}</p>
        </div>
        <div className="stat-card">
          <h3>Recent Grades</h3>
          <p>{dashboard?.recent_grades.length ?? 0}</p>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem', color: '#0f172a' }}>Recent Grades</h2>
      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {dashboard?.recent_grades.map((g, i) => (
            <tr key={i}>
              <td>{g.subject.name}</td>
              <td>{g.exam_type}</td>
              <td>{g.score}/{g.max_score}</td>
              <td>{g.grade_letter}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {timetable?.timetable && Object.keys(timetable.timetable).length > 0 && (
        <>
          <h2 style={{ marginTop: '2rem', color: '#0f172a' }}>Today's Schedule</h2>
          <table style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(timetable.timetable).flatMap(([day, entries]) =>
                entries.map((entry, i) => (
                  <tr key={`${day}-${i}`}>
                    <td style={{ textTransform: 'capitalize' }}>{day}</td>
                    <td>{entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}</td>
                    <td>{entry.subject.name}</td>
                    <td>{entry.teacher?.name ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
