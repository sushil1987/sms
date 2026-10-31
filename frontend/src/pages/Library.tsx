import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Plus, Library as LibraryIcon } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import DataTable from '../components/ui/DataTable';
import type { PaginatedResponse, School, Student } from '../types';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#a78bfa', '#f43f5e'];

export default function Library() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'books' | 'issues'>('books');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [bookForm, setBookForm] = useState({ school_id: '', title: '', author: '', isbn: '', category: '', total_copies: '1', shelf_location: '' });
  const [issueForm, setIssueForm] = useState({ book_id: '', student_id: '', due_date: '' });

  const { data: overview } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: async () => (await api.get('/reports/overview')).data,
  });

  const { data: libraryReport } = useQuery({
    queryKey: ['reports-library'],
    queryFn: async () => (await api.get('/reports/library')).data,
  });

  const { data: books } = useQuery({
    queryKey: ['books'],
    queryFn: async () => (await api.get('/books')).data,
  });

  const { data: issues } = useQuery({
    queryKey: ['book-issues'],
    queryFn: async () => (await api.get('/book-issues')).data,
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => (await api.get<School[]>('/schools')).data,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  const bookMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/books', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['books', 'reports-overview', 'reports-library'] }); setShowForm(false); setMessage('Book added.'); },
  });

  const issueMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/book-issues/issue', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['book-issues', 'books', 'reports-overview'] }); setShowForm(false); setMessage('Book issued.'); },
  });

  const returnMutation = useMutation({
    mutationFn: (id: number) => api.post(`/book-issues/${id}/return`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['book-issues', 'books', 'reports-overview'] }); setMessage('Book returned.'); },
  });

  const handleBookSubmit = (e: FormEvent) => {
    e.preventDefault();
    bookMutation.mutate({ ...bookForm, school_id: Number(bookForm.school_id), total_copies: Number(bookForm.total_copies) });
  };

  const handleIssueSubmit = (e: FormEvent) => {
    e.preventDefault();
    issueMutation.mutate({ ...issueForm, book_id: Number(issueForm.book_id), student_id: Number(issueForm.student_id) });
  };

  const lib = overview?.library;

  return (
    <div>
      <PageHeader title="Library" subtitle="Book catalog, issues, and circulation analytics" />

      <div className="stat-grid">
        <StatCard title="Total Copies" value={lib?.total_books ?? 0} icon={LibraryIcon} color="sky" />
        <StatCard title="Available" value={lib?.available ?? 0} icon={BookOpen} color="emerald" />
        <StatCard title="Issued" value={lib?.issued ?? 0} icon={BookOpen} color="amber" />
        <StatCard title="Overdue" value={lib?.overdue ?? 0} icon={BookOpen} color="rose" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Books by Category" subtitle="Collection breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={libraryReport?.by_category ?? []} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                {(libraryReport?.by_category ?? []).map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Issue Trend" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={libraryReport?.issue_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="tabs" style={{ marginTop: '1.5rem' }}>
        <button type="button" className={tab === 'books' ? 'active' : ''} onClick={() => setTab('books')}>Books</button>
        <button type="button" className={tab === 'issues' ? 'active' : ''} onClick={() => setTab('issues')}>Issues</button>
        <Button onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto' }}><Plus size={16} /> Add</Button>
      </div>

      {message && <div className="message success">{message}</div>}

      {showForm && tab === 'books' && (
        <form className="form-card" onSubmit={handleBookSubmit}>
          <div className="form-grid">
            <label>School<select value={bookForm.school_id} onChange={(e) => setBookForm({ ...bookForm, school_id: e.target.value })} required><option value="">Select</option>{schools?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Title<input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required /></label>
            <label>Author<input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} /></label>
            <label>ISBN<input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} /></label>
            <label>Category<input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} /></label>
            <label>Copies<input type="number" min="1" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} required /></label>
            <label>Shelf<input value={bookForm.shelf_location} onChange={(e) => setBookForm({ ...bookForm, shelf_location: e.target.value })} /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Save Book</Button>
        </form>
      )}

      {showForm && tab === 'issues' && (
        <form className="form-card" onSubmit={handleIssueSubmit}>
          <div className="form-grid">
            <label>Book<select value={issueForm.book_id} onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })} required><option value="">Select</option>{books?.data?.map((b: { id: number; title: string; available_copies: number }) => <option key={b.id} value={b.id}>{b.title} ({b.available_copies} avail)</option>)}</select></label>
            <label>Student<select value={issueForm.student_id} onChange={(e) => setIssueForm({ ...issueForm, student_id: e.target.value })} required><option value="">Select</option>{students?.data.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}</select></label>
            <label>Due Date<input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} required /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Issue Book</Button>
        </form>
      )}

      {tab === 'books' ? (
        <DataTable
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'author', header: 'Author', render: (r) => String(r.author ?? '—') },
            { key: 'category', header: 'Category', render: (r) => String(r.category ?? '—') },
            { key: 'copies', header: 'Copies', render: (r) => `${r.available_copies}/${r.total_copies}` },
            { key: 'shelf', header: 'Shelf', render: (r) => String(r.shelf_location ?? '—') },
          ]}
          data={books?.data ?? []}
        />
      ) : (
        <DataTable
          columns={[
            { key: 'book', header: 'Book', render: (r) => String((r.book as { title: string })?.title ?? '—') },
            { key: 'student', header: 'Student', render: (r) => String((r.student as { user: { name: string } })?.user?.name ?? '—') },
            { key: 'issued', header: 'Issued', render: (r) => new Date(r.issued_at as string).toLocaleDateString() },
            { key: 'due', header: 'Due', render: (r) => new Date(r.due_date as string).toLocaleDateString() },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'issued' ? 'warning' : 'success'}>{r.status as string}</Badge> },
            { key: 'action', header: '', render: (r) => r.status === 'issued' ? <Button variant="secondary" onClick={() => returnMutation.mutate(r.id as number)}>Return</Button> : null },
          ]}
          data={issues?.data ?? []}
        />
      )}
    </div>
  );
}
