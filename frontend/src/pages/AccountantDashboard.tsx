import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Receipt, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

interface AccountantData {
  total_collected: number;
  this_month: number;
  pending_count: number;
  active_students: number;
  fee_structures: number;
  monthly_chart: { month: string; total: number }[];
  recent_payments: {
    id: number;
    student: string;
    fee: string;
    amount_paid: number;
    payment_date: string;
    receipt_number: string;
    payment_method: string;
  }[];
  by_method: { payment_method: string; total: number; count: number }[];
}

export default function AccountantDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['accountant-dashboard'],
    queryFn: async () => (await api.get<AccountantData>('/accountant/dashboard')).data,
  });

  if (isLoading) return <p style={{ color: 'var(--text-muted)' }}>Loading portal...</p>;

  return (
    <div>
      <PageHeader
        title="Accountant Portal"
        subtitle="Collect fees, record payments, and track revenue"
        action={<Link to="/fees"><Button><Receipt size={16} /> Collect Fee</Button></Link>}
      />

      <div className="stat-grid">
        <StatCard title="Total Collected" value={`$${Number(data?.total_collected ?? 0).toLocaleString()}`} icon={DollarSign} color="emerald" />
        <StatCard title="This Month" value={`$${Number(data?.this_month ?? 0).toLocaleString()}`} icon={DollarSign} color="sky" />
        <StatCard title="Pending" value={data?.pending_count ?? 0} icon={AlertCircle} color="amber" />
        <StatCard title="Active Students" value={data?.active_students ?? 0} icon={Users} color="indigo" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Monthly Revenue" subtitle="Fee collection trend">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.monthly_chart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payments by Method">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.by_method?.length ? data.by_method.map((m) => (
              <div key={m.payment_method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge>{m.payment_method.replace('_', ' ')}</Badge>
                <span style={{ fontSize: '0.875rem' }}>${Number(m.total).toLocaleString()} ({m.count})</span>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No payments yet</p>}
          </div>
        </ChartCard>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <ChartCard title="Recent Payments" subtitle={`${data?.fee_structures ?? 0} active fee structures`}>
          <DataTable
            columns={[
              { key: 'student', header: 'Student' },
              { key: 'fee', header: 'Fee' },
              { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount_paid).toLocaleString()}` },
              { key: 'date', header: 'Date', render: (r) => new Date(r.payment_date as string).toLocaleDateString() },
              { key: 'method', header: 'Method', render: (r) => <Badge>{String(r.payment_method).replace('_', ' ')}</Badge> },
              { key: 'receipt', header: 'Receipt', render: (r) => String(r.receipt_number) },
            ]}
            data={(data?.recent_payments ?? []) as unknown as Record<string, unknown>[]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
