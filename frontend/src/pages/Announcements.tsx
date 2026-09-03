import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

export default function Announcements() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', body: '', target_audience: 'all', priority: 'normal', is_published: true });

  const { data, isLoading } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn: async () => (await api.get('/announcements')).data,
  });

  const saveMutation = useMutation({
    mutationFn: (p: typeof form) => api.post('/announcements', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements-admin'] }); setShowForm(false); setMessage('Announcement published.'); },
  });

  const priorityVariant = (p: string) => p === 'urgent' || p === 'high' ? 'danger' as const : p === 'normal' ? 'info' as const : 'default' as const;

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Broadcast messages to students, teachers, and parents"
        action={<Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Cancel' : 'New Announcement'}</Button>}
      />
      {message && <div className="message success">{message}</div>}
      {showForm && (
        <form className="form-card" onSubmit={(e: FormEvent) => { e.preventDefault(); saveMutation.mutate(form); }}>
          <div className="form-grid">
            <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>Audience<select value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })}><option value="all">Everyone</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="parent">Parents</option></select></label>
            <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Message<textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          </label>
          <Button type="submit" style={{ marginTop: '1rem' }}>Publish</Button>
        </form>
      )}
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'audience', header: 'Audience', render: (r) => <Badge>{r.target_audience as string}</Badge> },
            { key: 'priority', header: 'Priority', render: (r) => <Badge variant={priorityVariant(r.priority as string)}>{r.priority as string}</Badge> },
            { key: 'status', header: 'Status', render: (r) => r.is_published ? <Badge variant="success">Published</Badge> : <Badge>Draft</Badge> },
            { key: 'date', header: 'Date', render: (r) => r.published_at ? new Date(r.published_at as string).toLocaleDateString() : '—' },
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
