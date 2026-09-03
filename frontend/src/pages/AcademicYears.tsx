import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export default function AcademicYears() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', is_current: false });

  const { data: years, isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get<AcademicYear[]>('/academic-years')).data,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/academic-years', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setShowForm(false);
      setMessage('Academic year created.');
    },
    onError: () => setMessage('Failed to create academic year.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    saveMutation.mutate(form);
  };

  return (
    <div>
      <PageHeader
        title="Academic Years"
        subtitle="Manage school academic calendar"
        action={<Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Cancel' : 'Add Year'}</Button>}
      />
      {message && <div className="message success">{message}</div>}
      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Start Date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required /></label>
            <label>End Date<input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required /></label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
              Set as current year
            </label>
          </div>
          <Button type="submit" disabled={saveMutation.isPending} style={{ marginTop: '1rem' }}>Save</Button>
        </form>
      )}
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'start', header: 'Start', render: (r) => new Date(r.start_date as string).toLocaleDateString() },
            { key: 'end', header: 'End', render: (r) => new Date(r.end_date as string).toLocaleDateString() },
            { key: 'current', header: 'Status', render: (r) => r.is_current ? <Badge variant="success">Current</Badge> : <Badge>Inactive</Badge> },
          ]}
          data={(years ?? []) as unknown as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}
