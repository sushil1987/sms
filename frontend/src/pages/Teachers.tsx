import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

interface Teacher {
  id: number;
  employee_id: string;
  department?: string;
  qualification?: string;
  user: { name: string; email: string };
}

export default function Teachers() {
  const { user } = useAuthStore();
  const canManage = user?.role?.slug === 'admin' || user?.role?.slug === 'principal';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: 'password', phone: '',
    employee_id: '', department: '', qualification: '', hire_date: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await api.get('/teachers')).data,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/teachers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'principal-dashboard'] });
      setShowForm(false);
      setForm({ name: '', email: '', password: 'password', phone: '', employee_id: '', department: '', qualification: '', hire_date: '' });
      setMessage('Teacher added successfully.');
    },
    onError: () => setMessage('Failed to add teacher.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    saveMutation.mutate(form);
  };

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle="Faculty and staff management"
        action={canManage ? <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Cancel' : 'Add Teacher'}</Button> : undefined}
      />

      {message && <div className="message success">{message}</div>}

      {showForm && canManage && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
            <label>Employee ID<input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required /></label>
            <label>Department<input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label>
            <label>Qualification<input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Hire Date<input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} /></label>
          </div>
          <Button type="submit" disabled={saveMutation.isPending} style={{ marginTop: '1rem' }}>Save Teacher</Button>
        </form>
      )}

      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'id', header: 'Employee ID', render: (r) => String((r as unknown as Teacher).employee_id ?? '') },
            { key: 'name', header: 'Name', render: (r) => (r as unknown as Teacher).user?.name ?? '' },
            { key: 'email', header: 'Email', render: (r) => (r as unknown as Teacher).user?.email ?? '' },
            { key: 'dept', header: 'Department', render: (r) => String((r as unknown as Teacher).department ?? '—') },
            { key: 'qual', header: 'Qualification', render: (r) => String((r as unknown as Teacher).qualification ?? '—') },
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
