import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import type { PaginatedResponse, Student } from '../types';
import '../components/ui/DataTable.css';

export default function Students() {
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  return (
    <div>
      <PageHeader title="Students" subtitle="Manage student records and profiles" />
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'admission', header: 'Admission #', render: (r) => (r as unknown as Student).admission_number },
            { key: 'name', header: 'Name', render: (r) => (r as unknown as Student).user.name },
            { key: 'email', header: 'Email', render: (r) => (r as unknown as Student).user.email },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={(r as unknown as Student).status === 'active' ? 'success' : 'default'}>{(r as unknown as Student).status}</Badge> },
          ]}
          data={data?.data as unknown as Record<string, unknown>[] ?? []}
        />
      )}
    </div>
  );
}
