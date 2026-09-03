import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { AcademicYear, ClassSection, Enrollment, PaginatedResponse, Student } from '../types';
import './Forms.css';
import './ResourceList.css';

export default function Enrollments() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', class_section_id: '', academic_year_id: '' });
  const [message, setMessage] = useState('');

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => (await api.get<PaginatedResponse<Enrollment>>('/enrollments')).data,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => (await api.get<PaginatedResponse<ClassSection>>('/classes')).data,
  });

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get<AcademicYear[]>('/academic-years')).data,
  });

  const enrollMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/enrollments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setShowForm(false);
      setForm({ student_id: '', class_section_id: '', academic_year_id: '' });
      setMessage('Student enrolled successfully.');
    },
    onError: () => setMessage('Failed to enroll student.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    enrollMutation.mutate(form);
  };

  return (
    <div className="resource-page">
      <header className="page-header">
        <h1>Enrollments</h1>
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Enroll Student'}
        </button>
      </header>

      {message && <div className={`message ${enrollMutation.isError ? 'error' : 'success'}`}>{message}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Student
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
                <option value="">Select student</option>
                {students?.data.map((s) => (
                  <option key={s.id} value={s.id}>{s.user.name} ({s.admission_number})</option>
                ))}
              </select>
            </label>
            <label>
              Class
              <select value={form.class_section_id} onChange={(e) => setForm({ ...form, class_section_id: e.target.value })} required>
                <option value="">Select class</option>
                {classes?.data.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Academic Year
              <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} required>
                <option value="">Select year</option>
                {years?.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={enrollMutation.isPending} style={{ marginTop: '1rem' }}>
            {enrollMutation.isPending ? 'Saving...' : 'Enroll'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading enrollments...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission #</th>
              <th>Class</th>
              <th>Academic Year</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {enrollments?.data.map((e) => (
              <tr key={e.id}>
                <td>{e.student.user.name}</td>
                <td>{e.student.admission_number}</td>
                <td>{e.class_section.name}</td>
                <td>{e.academic_year.name}</td>
                <td><span className={`status status-${e.status}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
