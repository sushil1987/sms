import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

export default function Classes() {
  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get('/classes')).data,
  });

  return (
    <div>
      <PageHeader title="Classes" subtitle="Class sections and grade levels" />
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'grade', header: 'Grade', render: (r) => String(r.grade_level ?? '') },
            { key: 'section', header: 'Section', render: (r) => String(r.section ?? '') },
            { key: 'capacity', header: 'Capacity' },
            { key: 'year', header: 'Academic Year', render: (r) => (r.academic_year as { name: string })?.name },
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
