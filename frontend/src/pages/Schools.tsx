import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Users } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

interface School {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  city?: string;
  principal_name?: string;
  is_active: boolean;
  students_count?: number;
  teachers_count?: number;
}

export default function Schools() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', code: '', email: '', phone: '', address: '', city: '', principal_name: '',
  });

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => (await api.get<School[]>('/schools')).data,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/schools', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setShowForm(false);
      setForm({ name: '', code: '', email: '', phone: '', address: '', city: '', principal_name: '' });
      setMessage('School created successfully.');
    },
    onError: () => setMessage('Failed to create school.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    saveMutation.mutate(form);
  };

  const totalStudents = schools?.reduce((sum, s) => sum + (s.students_count ?? 0), 0) ?? 0;
  const totalTeachers = schools?.reduce((sum, s) => sum + (s.teachers_count ?? 0), 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="Schools"
        subtitle="Multi-school management and campus overview"
        action={<Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Cancel' : 'Add School'}</Button>}
      />

      <div className="stat-grid">
        <StatCard title="Total Schools" value={schools?.length ?? 0} icon={Building2} color="sky" />
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="emerald" />
        <StatCard title="Total Teachers" value={totalTeachers} icon={Users} color="indigo" />
      </div>

      {message && <div className="message success">{message}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Code<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label>Principal<input value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} /></label>
            <label>Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          </div>
          <Button type="submit" disabled={saveMutation.isPending} style={{ marginTop: '1rem' }}>Save School</Button>
        </form>
      )}

      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'name', header: 'School' },
            { key: 'code', header: 'Code' },
            { key: 'city', header: 'City', render: (r) => String(r.city ?? '—') },
            { key: 'principal', header: 'Principal', render: (r) => String(r.principal_name ?? '—') },
            { key: 'students', header: 'Students', render: (r) => String(r.students_count ?? 0) },
            { key: 'teachers', header: 'Teachers', render: (r) => String(r.teachers_count ?? 0) },
            { key: 'status', header: 'Status', render: (r) => r.is_active ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge> },
          ]}
          data={(schools ?? []) as unknown as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}
