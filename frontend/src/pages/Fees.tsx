import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import DataTable from '../components/ui/DataTable';
import type { AcademicYear, PaginatedResponse, Student } from '../types';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

export default function Fees() {
  const { user } = useAuthStore();
  const isAccountant = user?.role?.slug === 'accountant';
  const canManageStructures = user?.role?.slug === 'admin';
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'structures' | 'payments'>(isAccountant ? 'payments' : 'structures');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [structForm, setStructForm] = useState({ name: '', academic_year_id: '', grade_level: '', amount: '', due_date: '' });
  const [payForm, setPayForm] = useState({ student_id: '', fee_structure_id: '', amount_paid: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash' });

  const { data: summary } = useQuery({
    queryKey: ['fee-summary'],
    queryFn: async () => (await api.get('/fee-payments/summary')).data,
  });

  const { data: structures } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => (await api.get('/fee-structures')).data,
  });

  const { data: payments } = useQuery({
    queryKey: ['fee-payments'],
    queryFn: async () => (await api.get('/fee-payments')).data,
  });

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get<AcademicYear[]>('/academic-years')).data,
    enabled: canManageStructures,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  const structMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/fee-structures', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fee-structures'] }); setShowForm(false); setMessage('Fee structure created.'); },
  });

  const payMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/fee-payments', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fee-payments', 'fee-summary', 'accountant-dashboard'] }); setShowForm(false); setMessage('Payment recorded.'); },
  });

  return (
    <div>
      <PageHeader title={isAccountant ? 'Fee Collection' : 'Fee Management'} subtitle={isAccountant ? 'Record payments and view collection history' : 'Structures, payments, and revenue tracking'} />

      <div className="stat-grid">
        <StatCard title="Total Collected" value={`$${Number(summary?.total_collected ?? 0).toLocaleString()}`} icon={DollarSign} color="emerald" />
        <StatCard title="This Month" value={`$${Number(summary?.this_month ?? 0).toLocaleString()}`} icon={DollarSign} color="sky" />
        <StatCard title="Pending" value={summary?.pending_count ?? 0} icon={DollarSign} color="amber" />
      </div>

      <ChartCard title="Monthly Revenue" subtitle="Fee collection trend">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={summary?.monthly_chart ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
            <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="tabs" style={{ marginTop: '1.5rem' }}>
        {canManageStructures && (
          <button type="button" className={tab === 'structures' ? 'active' : ''} onClick={() => setTab('structures')}>Fee Structures</button>
        )}
        <button type="button" className={tab === 'payments' ? 'active' : ''} onClick={() => setTab('payments')}>Payments</button>
        <Button onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto' }}><Plus size={16} /> {showForm ? 'Cancel' : tab === 'payments' || isAccountant ? 'Record Payment' : 'Add'}</Button>
      </div>

      {message && <div className="message success">{message}</div>}

      {showForm && tab === 'structures' && canManageStructures && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); structMutation.mutate({ ...structForm, academic_year_id: Number(structForm.academic_year_id), amount: Number(structForm.amount) }); }}>
          <div className="form-grid">
            <label>Name<input value={structForm.name} onChange={(e) => setStructForm({ ...structForm, name: e.target.value })} required /></label>
            <label>Academic Year<select value={structForm.academic_year_id} onChange={(e) => setStructForm({ ...structForm, academic_year_id: e.target.value })} required><option value="">Select</option>{years?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></label>
            <label>Grade Level<input value={structForm.grade_level} onChange={(e) => setStructForm({ ...structForm, grade_level: e.target.value })} /></label>
            <label>Amount<input type="number" value={structForm.amount} onChange={(e) => setStructForm({ ...structForm, amount: e.target.value })} required /></label>
            <label>Due Date<input type="date" value={structForm.due_date} onChange={(e) => setStructForm({ ...structForm, due_date: e.target.value })} /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Save Structure</Button>
        </form>
      )}

      {showForm && tab === 'payments' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); payMutation.mutate({ ...payForm, student_id: Number(payForm.student_id), fee_structure_id: Number(payForm.fee_structure_id), amount_paid: Number(payForm.amount_paid) }); }}>
          <div className="form-grid">
            <label>Student<select value={payForm.student_id} onChange={(e) => setPayForm({ ...payForm, student_id: e.target.value })} required><option value="">Select</option>{students?.data.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}</select></label>
            <label>Fee Structure<select value={payForm.fee_structure_id} onChange={(e) => setPayForm({ ...payForm, fee_structure_id: e.target.value })} required><option value="">Select</option>{structures?.data?.map((f: { id: number; name: string }) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
            <label>Amount<input type="number" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} required /></label>
            <label>Date<input type="date" value={payForm.payment_date} onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })} required /></label>
            <label>Method<select value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="online">Online</option></select></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Record Payment</Button>
        </form>
      )}

      {tab === 'structures' && canManageStructures ? (
        <DataTable
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'grade', header: 'Grade', render: (r) => String(r.grade_level ?? 'All') },
            { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount).toLocaleString()}` },
            { key: 'year', header: 'Year', render: (r) => String((r.academic_year as { name: string })?.name ?? '—') },
            { key: 'status', header: 'Status', render: (r) => r.is_active ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge> },
          ]}
          data={structures?.data ?? []}
        />
      ) : (
        <DataTable
          columns={[
            { key: 'student', header: 'Student', render: (r) => String((r.student as { user: { name: string } })?.user?.name ?? '—') },
            { key: 'fee', header: 'Fee', render: (r) => String((r.fee_structure as { name: string })?.name ?? '—') },
            { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount_paid).toLocaleString()}` },
            { key: 'date', header: 'Date', render: (r) => new Date(r.payment_date as string).toLocaleDateString() },
            { key: 'receipt', header: 'Receipt', render: (r) => String(r.receipt_number ?? '') },
            { key: 'status', header: 'Status', render: (r) => <Badge variant="success">{r.status as string}</Badge> },
          ]}
          data={payments?.data ?? []}
        />
      )}
    </div>
  );
}
