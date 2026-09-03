import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Building2, Users, GraduationCap, Library, Bus, Home, DollarSign,
} from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';
import '../components/ui/ChartCard.css';

const COLORS = ['#6366f1', '#10b981', '#38bdf8', '#f59e0b', '#f472b6'];

export default function Reports() {
  const { data: overview } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: async () => (await api.get('/reports/overview')).data,
  });

  const { data: library } = useQuery({
    queryKey: ['reports-library'],
    queryFn: async () => (await api.get('/reports/library')).data,
  });

  const { data: transport } = useQuery({
    queryKey: ['reports-transport'],
    queryFn: async () => (await api.get('/reports/transport')).data,
  });

  const { data: hostel } = useQuery({
    queryKey: ['reports-hostel'],
    queryFn: async () => (await api.get('/reports/hostel')).data,
  });

  const { data: schools } = useQuery({
    queryKey: ['reports-schools'],
    queryFn: async () => (await api.get('/reports/schools')).data,
  });

  return (
    <div>
      <PageHeader title="Advanced Reports" subtitle="Cross-module analytics and multi-school insights" />

      <div className="stat-grid">
        <StatCard title="Schools" value={overview?.schools ?? 0} icon={Building2} color="indigo" />
        <StatCard title="Students" value={overview?.students ?? 0} icon={Users} color="emerald" />
        <StatCard title="Teachers" value={overview?.teachers ?? 0} icon={GraduationCap} color="sky" />
        <StatCard title="Books Issued" value={overview?.library?.issued ?? 0} icon={Library} color="amber" />
        <StatCard title="Transport Riders" value={overview?.transport?.students ?? 0} icon={Bus} color="indigo" />
        <StatCard title="Hostel Residents" value={overview?.hostel?.allocations ?? 0} icon={Home} color="rose" />
      </div>

      <div className="chart-grid">
        <ChartCard title="Library by Category">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={library?.by_category ?? []} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={85} label>
                {(library?.by_category ?? []).map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Transport Routes">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={transport?.routes ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Bar dataKey="students" fill="#10b981" name="Students" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hostel Occupancy" className="chart-grid-full">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hostel?.by_hostel ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="capacity" fill="#6366f1" name="Capacity" radius={[4, 4, 0, 0]} />
              <Bar dataKey="occupied" fill="#10b981" name="Occupied" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <ChartCard title="Multi-School Comparison" subtitle="Students, teachers, and fees by campus">
          <DataTable
          columns={[
            { key: 'name', header: 'School' },
            { key: 'code', header: 'Code' },
            { key: 'city', header: 'City', render: (r) => String(r.city ?? '—') },
            { key: 'students', header: 'Students' },
            { key: 'teachers', header: 'Teachers' },
            { key: 'books', header: 'Books' },
            { key: 'routes', header: 'Routes' },
            { key: 'hostels', header: 'Hostels' },
            { key: 'fees', header: 'Fees Collected', render: (r) => <span><DollarSign size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Number(r.fees_collected).toLocaleString()}</span> },
          ]}
          data={(schools ?? []) as Record<string, unknown>[]}
        />
        </ChartCard>
      </div>
    </div>
  );
}
