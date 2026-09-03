import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { AcademicYear, ClassSection, PaginatedResponse, Subject, TimetableEntry } from '../types';
import './Forms.css';
import './ResourceList.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface StudentTimetableData {
  class: { name: string };
  timetable: Record<string, TimetableEntry[]>;
}

export default function Timetable() {
  const { user } = useAuthStore();
  const role = user?.role?.slug;
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    class_section_id: '', subject_id: '', teacher_id: '', academic_year_id: '',
    day_of_week: 'monday', start_time: '09:00', end_time: '09:45', room: '',
  });

  const { data: studentTimetable } = useQuery({
    queryKey: ['student-timetable-view'],
    queryFn: async () => (await api.get<StudentTimetableData>('/student/timetable')).data,
    enabled: isStudent,
  });

  const { data: timetables } = useQuery({
    queryKey: ['timetables', classFilter],
    queryFn: async () => (await api.get<PaginatedResponse<TimetableEntry>>('/timetables', {
      params: classFilter ? { class_section_id: classFilter } : {},
    })).data,
    enabled: !isStudent,
  });

  const { data: classes } = useQuery({
    queryKey: ['timetable-classes'],
    queryFn: async () => {
      const endpoint = isAdmin ? '/classes' : '/teacher/classes';
      const { data } = await api.get<ClassSection[] | PaginatedResponse<ClassSection>>(endpoint);
      return Array.isArray(data) ? data : data.data;
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Subject>>('/subjects')).data,
    enabled: isAdmin,
  });

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get<AcademicYear[]>('/academic-years')).data,
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/timetables', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setShowForm(false);
      setMessage('Timetable entry added.');
    },
    onError: () => setMessage('Failed to add timetable entry.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    saveMutation.mutate({
      ...form,
      class_section_id: Number(form.class_section_id),
      subject_id: Number(form.subject_id),
      teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      academic_year_id: Number(form.academic_year_id),
    });
  };

  const grouped = isStudent
    ? (studentTimetable?.timetable ?? {})
    : (timetables?.data ?? []).reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
        const day = entry.day_of_week;
        acc[day] = acc[day] ?? [];
        acc[day].push(entry);
        return acc;
      }, {});

  return (
    <div className="resource-page">
      <header className="page-header">
        <h1>Timetable</h1>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Entry'}
          </button>
        )}
      </header>

      {!isStudent && (
        <div className="filters">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All classes</option>
            {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {isStudent && studentTimetable?.class && (
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>Class: {studentTimetable.class.name}</p>
      )}

      {message && <div className={`message ${saveMutation.isError ? 'error' : 'success'}`}>{message}</div>}

      {showForm && isAdmin && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Class
              <select value={form.class_section_id} onChange={(e) => setForm({ ...form, class_section_id: e.target.value })} required>
                <option value="">Select class</option>
                {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Subject
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required>
                <option value="">Select subject</option>
                {subjects?.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>Academic Year
              <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} required>
                <option value="">Select year</option>
                {years?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </label>
            <label>Day
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}>
                {DAYS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </label>
            <label>Start
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            </label>
            <label>End
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
            </label>
            <label>Room
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </label>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Save</button>
        </form>
      )}

      {DAYS.map((day) => grouped[day]?.length ? (
        <div key={day} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ textTransform: 'capitalize', color: '#334155' }}>{day}</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Teacher</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {grouped[day].map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}</td>
                  <td>{entry.subject.name}</td>
                  <td>{entry.class_section?.name ?? '—'}</td>
                  <td>{entry.teacher?.name ?? '—'}</td>
                  <td>{entry.room ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null)}
    </div>
  );
}
