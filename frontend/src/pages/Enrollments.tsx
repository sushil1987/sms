import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import type { AcademicYear, ClassSection, Enrollment, PaginatedResponse, Student } from '../types';
import '../components/ui/DataTable.css';

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
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Assign students to classes"
        action={<Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Enroll Student'}</Button>}
      />

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
          <Button type="submit" disabled={enrollMutation.isPending} style={{ marginTop: '1rem' }}>
            {enrollMutation.isPending ? 'Saving...' : 'Enroll'}
          </Button>
        </form>
      )}

      {isLoading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <DataTable
          columns={[
            { key: 'student', header: 'Student', render: (r) => (r as unknown as Enrollment).student.user.name },
            { key: 'admission', header: 'Admission #', render: (r) => (r as unknown as Enrollment).student.admission_number },
            { key: 'class', header: 'Class', render: (r) => (r as unknown as Enrollment).class_section.name },
            { key: 'year', header: 'Academic Year', render: (r) => (r as unknown as Enrollment).academic_year.name },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={(r as unknown as Enrollment).status === 'active' ? 'success' : 'default'}>{(r as unknown as Enrollment).status}</Badge> },
          ]}
          data={enrollments?.data as unknown as Record<string, unknown>[] ?? []}
        />
      )}
    </div>
  );
}
