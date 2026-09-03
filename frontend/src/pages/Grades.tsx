import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { AcademicYear, ClassSection, Grade, PaginatedResponse, Student, Subject } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import '../components/ui/DataTable.css';

export default function Grades() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.slug === 'admin';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    student_id: '', subject_id: '', class_section_id: '', academic_year_id: '',
    exam_type: 'Midterm', score: '', max_score: '100',
  });

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => (await api.get<PaginatedResponse<Grade>>('/grades')).data,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
    enabled: isAdmin,
  });

  const classesEndpoint = isAdmin ? '/classes' : '/teacher/classes';
  const { data: classes } = useQuery({
    queryKey: ['grade-classes', classesEndpoint],
    queryFn: async () => (await api.get<ClassSection[] | PaginatedResponse<ClassSection>>(classesEndpoint)).data,
  });
  const classList = Array.isArray(classes) ? classes : classes?.data ?? [];

  const { data: subjects } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Subject>>('/subjects')).data,
  });

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get<AcademicYear[]>('/academic-years')).data,
  });

  const { data: classStudents } = useQuery({
    queryKey: ['class-students', form.class_section_id],
    queryFn: async () => (await api.get(`/teacher/classes/${form.class_section_id}/students`)).data,
    enabled: !isAdmin && !!form.class_section_id,
  });

  const studentOptions = isAdmin
    ? students?.data ?? []
    : (classStudents?.students ?? []).map((s: Student) => s);

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/grades', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setShowForm(false);
      setMessage('Grade recorded successfully.');
    },
    onError: () => setMessage('Failed to record grade.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    saveMutation.mutate({
      ...form,
      student_id: Number(form.student_id),
      subject_id: Number(form.subject_id),
      class_section_id: Number(form.class_section_id),
      academic_year_id: Number(form.academic_year_id),
      score: Number(form.score),
      max_score: Number(form.max_score),
    });
  };

  return (
    <div>
      <PageHeader
        title="Grades"
        subtitle="Record and manage exam results"
        action={<Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Record Grade'}</Button>}
      />

      {message && <div className={`message ${saveMutation.isError ? 'error' : 'success'}`}>{message}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            {!isAdmin && (
              <label>
                Class
                <select value={form.class_section_id} onChange={(e) => setForm({ ...form, class_section_id: e.target.value, student_id: '' })} required>
                  <option value="">Select class</option>
                  {classList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}
            <label>
              Student
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
                <option value="">Select student</option>
                {studentOptions.map((s: Student) => (
                  <option key={s.id} value={s.id}>{s.user.name}</option>
                ))}
              </select>
            </label>
            {isAdmin && (
              <label>
                Class
                <select value={form.class_section_id} onChange={(e) => setForm({ ...form, class_section_id: e.target.value })} required>
                  <option value="">Select class</option>
                  {classList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}
            <label>
              Subject
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required>
                <option value="">Select subject</option>
                {subjects?.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>
              Academic Year
              <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} required>
                <option value="">Select year</option>
                {years?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </label>
            <label>
              Exam Type
              <input value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} required />
            </label>
            <label>
              Score
              <input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
            </label>
            <label>
              Max Score
              <input type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} />
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={saveMutation.isPending} style={{ marginTop: '1rem' }}>
            {saveMutation.isPending ? 'Saving...' : 'Save Grade'}
          </button>
        </form>
      )}

      {isLoading ? <p>Loading grades...</p> : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades?.data.map((g) => (
              <tr key={g.id}>
                <td>{g.student.user.name}</td>
                <td>{g.subject.name}</td>
                <td>{g.exam_type}</td>
                <td>{g.score}/{g.max_score}</td>
                <td>{g.grade_letter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
