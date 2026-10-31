import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

export default function Subjects() {
  const { data, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/subjects')).data,
  });

  return (
    <div>
      <PageHeader title="Subjects" subtitle="Curriculum and course catalog" />
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'code', header: 'Code' },
            { key: 'name', header: 'Name' },
            { key: 'desc', header: 'Description', render: (r) => String(r.description ?? '—') },
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
