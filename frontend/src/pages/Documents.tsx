import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Download } from 'lucide-react';
import api from '../lib/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import type { PaginatedResponse, Student } from '../types';
import '../components/ui/DataTable.css';

export default function Documents() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('certificate');
  const [file, setFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => (await api.get('/documents')).data,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('student_id', studentId);
      fd.append('title', title);
      fd.append('type', type);
      if (file) fd.append('file', file);
      return api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowForm(false);
      setMessage('Document uploaded.');
    },
    onError: () => setMessage('Upload failed.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    uploadMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Certificates, ID cards, transcripts, and more"
        action={<Button onClick={() => setShowForm(!showForm)}><Upload size={16} /> {showForm ? 'Cancel' : 'Upload'}</Button>}
      />
      {message && <div className={`message ${uploadMutation.isError ? 'error' : 'success'}`}>{message}</div>}
      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Student<select value={studentId} onChange={(e) => setStudentId(e.target.value)} required><option value="">Select</option>{students?.data.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}</select></label>
            <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
            <label>Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="certificate">Certificate</option><option value="id_card">ID Card</option><option value="transcript">Transcript</option><option value="medical">Medical</option><option value="other">Other</option></select></label>
            <label>File<input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required /></label>
          </div>
          <Button type="submit" disabled={uploadMutation.isPending} style={{ marginTop: '1rem' }}>Upload Document</Button>
        </form>
      )}
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        <DataTable
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'type', header: 'Type', render: (r) => <Badge variant="info">{(r.type as string).replace('_', ' ')}</Badge> },
            { key: 'file', header: 'File', render: (r) => r.file_name as string },
            { key: 'size', header: 'Size', render: (r) => `${Math.round(Number(r.file_size) / 1024)} KB` },
            { key: 'action', header: '', render: (r) => (
              <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${r.file_path}`} target="_blank" rel="noreferrer">
                <Button variant="ghost"><Download size={14} /></Button>
              </a>
            )},
          ]}
          data={data?.data ?? []}
        />
      )}
    </div>
  );
}
