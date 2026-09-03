import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

export default function Teachers() {
  const { data, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await api.get('/teachers')).data,
  });

  return (
    <div>
      <PageHeader title="Teachers" subtitle="Faculty and staff management" />
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'id', header: 'Employee ID', render: (r) => String(r.employee_id ?? '') },
            { key: 'name', header: 'Name', render: (r) => (r.user as { name: string })?.name ?? '' },
            { key: 'email', header: 'Email', render: (r) => (r.user as { email: string })?.email ?? '' },
            { key: 'dept', header: 'Department', render: (r) => String(r.department ?? '') },
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
