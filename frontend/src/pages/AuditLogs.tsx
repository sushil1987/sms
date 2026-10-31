import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import '../components/ui/DataTable.css';

export default function AuditLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => (await api.get('/audit-logs')).data,
  });

  const actionVariant = (a: string) => {
    if (a === 'created' || a === 'uploaded') return 'success' as const;
    if (a === 'deleted') return 'danger' as const;
    return 'info' as const;
  };

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Track all system changes and user actions" />
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'user', header: 'User', render: (r) => (r.user as { name: string })?.name ?? 'System' },
            { key: 'action', header: 'Action', render: (r) => <Badge variant={actionVariant(r.action as string)}>{r.action as string}</Badge> },
            { key: 'model', header: 'Model', render: (r) => r.model_type ? String(r.model_type).split('\\').pop() ?? '—' : '—' },
            { key: 'ip', header: 'IP', render: (r) => String(r.ip_address ?? '—') },
            { key: 'date', header: 'Date', render: (r) => new Date(r.created_at as string).toLocaleString() },
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
