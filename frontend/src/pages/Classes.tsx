import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { AcademicYear } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

interface TeacherOption {
  id: number;
  user: { id: number; name: string };
}

export default function Classes() {
  const { user } = useAuthStore();
  const canManage = user?.role?.slug === 'admin' || user?.role?.slug === 'principal';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    academic_year_id: '', name: '', grade_level: '', section: '', capacity: '35', class_teacher_id: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get('/classes')).data,
  });

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get<AcademicYear[]>('/academic-years')).data,
    enabled: canManage,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: async () => (await api.get('/teachers')).data,
    enabled: canManage,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (editingId) return api.put(`/classes/${editingId}`, payload);
      return api.post('/classes', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', 'principal-dashboard'] });
      setShowForm(false);
      setEditingId(null);
      setForm({ academic_year_id: '', name: '', grade_level: '', section: '', capacity: '35', class_teacher_id: '' });
      setMessage(editingId ? 'Class updated.' : 'Class created.');
    },
    onError: () => setMessage('Failed to save class.'),
  });

  const startEdit = (row: Record<string, unknown>) => {
    const teacher = row.class_teacher as { id: number } | null;
    setEditingId(row.id as number);
    setForm({
      academic_year_id: String((row.academic_year as { id: number })?.id ?? ''),
      name: String(row.name),
      grade_level: String(row.grade_level),
      section: String(row.section ?? ''),
      capacity: String(row.capacity ?? '35'),
      class_teacher_id: teacher ? String(teacher.id) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    saveMutation.mutate({
      ...form,
      academic_year_id: Number(form.academic_year_id),
      capacity: Number(form.capacity),
      class_teacher_id: form.class_teacher_id ? Number(form.class_teacher_id) : null,
    });
  };

  const teacherOptions: TeacherOption[] = teachers?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Class sections and teacher assignments"
        action={canManage ? <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }}><Plus size={16} /> {showForm ? 'Cancel' : 'Add Class'}</Button> : undefined}
      />

      {message && <div className="message success">{message}</div>}

      {showForm && canManage && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            {!editingId && (
              <>
                <label>Academic Year<select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} required><option value="">Select</option>{years?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></label>
                <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                <label>Grade Level<input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} required /></label>
                <label>Section<input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></label>
                <label>Capacity<input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
              </>
            )}
            <label>Class Teacher
              <select value={form.class_teacher_id} onChange={(e) => setForm({ ...form, class_teacher_id: e.target.value })}>
                <option value="">Unassigned</option>
                {teacherOptions.map((t) => <option key={t.id} value={t.user.id}>{t.user.name}</option>)}
              </select>
            </label>
          </div>
          <Button type="submit" disabled={saveMutation.isPending} style={{ marginTop: '1rem' }}>
            {editingId ? 'Update Assignment' : 'Save Class'}
          </Button>
        </form>
      )}

      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'grade', header: 'Grade', render: (r) => String(r.grade_level ?? '') },
            { key: 'section', header: 'Section', render: (r) => String(r.section ?? '') },
            { key: 'capacity', header: 'Capacity' },
            { key: 'teacher', header: 'Class Teacher', render: (r) => {
              const t = r.class_teacher as { name: string } | null;
              return t ? <Badge variant="success">{t.name}</Badge> : <Badge variant="warning">Unassigned</Badge>;
            }},
            { key: 'year', header: 'Academic Year', render: (r) => (r.academic_year as { name: string })?.name },
            ...(canManage ? [{ key: 'action', header: '', render: (r: Record<string, unknown>) => (
              <Button variant="secondary" onClick={() => startEdit(r)}>Assign Teacher</Button>
            )}] : []),
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
