import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Plus, BedDouble } from 'lucide-react';
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

export default function Hostel() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'hostels' | 'rooms' | 'allocations'>('hostels');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [hostelForm, setHostelForm] = useState({ school_id: '', name: '', type: 'boys', address: '', warden_name: '', warden_phone: '' });
  const [roomForm, setRoomForm] = useState({ hostel_id: '', room_number: '', floor: '1', capacity: '4' });
  const [allocForm, setAllocForm] = useState({ student_id: '', hostel_room_id: '' });

  const { data: overview } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: async () => (await api.get('/reports/overview')).data,
  });

  const { data: hostelReport } = useQuery({
    queryKey: ['reports-hostel'],
    queryFn: async () => (await api.get('/reports/hostel')).data,
  });

  const { data: hostels } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => (await api.get('/hostels')).data,
  });

  const { data: rooms } = useQuery({
    queryKey: ['hostel-rooms'],
    queryFn: async () => (await api.get('/hostel-rooms')).data,
  });

  const { data: allocations } = useQuery({
    queryKey: ['hostel-allocations'],
    queryFn: async () => (await api.get('/hostel-allocations')).data,
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => (await api.get<School[]>('/schools')).data,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  const hostelMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/hostels', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hostels', 'reports-overview', 'reports-hostel'] }); setShowForm(false); setMessage('Hostel created.'); },
  });

  const roomMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/hostel-rooms', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hostel-rooms', 'reports-hostel'] }); setShowForm(false); setMessage('Room added.'); },
  });

  const allocMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/hostel-allocations', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hostel-allocations', 'hostel-rooms', 'reports-overview', 'reports-hostel'] }); setShowForm(false); setMessage('Student allocated.'); },
  });

  const vacateMutation = useMutation({
    mutationFn: (id: number) => api.post(`/hostel-allocations/${id}/vacate`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hostel-allocations', 'hostel-rooms', 'reports-overview', 'reports-hostel'] }); setMessage('Room vacated.'); },
  });

  const hostel = overview?.hostel;
  const occupancyRate = hostel?.total_capacity ? Math.round((hostel.occupied / hostel.total_capacity) * 100) : 0;

  return (
    <div>
      <PageHeader title="Hostel" subtitle="Accommodation, rooms, and student allocations" />

      <div className="stat-grid">
        <StatCard title="Hostels" value={hostel?.hostels ?? 0} icon={Home} color="sky" />
        <StatCard title="Rooms" value={hostel?.rooms ?? 0} icon={BedDouble} color="emerald" />
        <StatCard title="Capacity" value={hostel?.total_capacity ?? 0} icon={BedDouble} color="indigo" />
        <StatCard title="Occupancy" value={`${occupancyRate}%`} icon={Home} color="amber" />
      </div>

      <ChartCard title="Occupancy by Hostel" subtitle="Capacity vs occupied beds">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hostelReport?.by_hostel ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
            <Bar dataKey="capacity" fill="#6366f1" name="Capacity" radius={[4, 4, 0, 0]} />
            <Bar dataKey="occupied" fill="#10b981" name="Occupied" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="tabs" style={{ marginTop: '1.5rem' }}>
        <button type="button" className={tab === 'hostels' ? 'active' : ''} onClick={() => setTab('hostels')}>Hostels</button>
        <button type="button" className={tab === 'rooms' ? 'active' : ''} onClick={() => setTab('rooms')}>Rooms</button>
        <button type="button" className={tab === 'allocations' ? 'active' : ''} onClick={() => setTab('allocations')}>Allocations</button>
        <Button onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto' }}><Plus size={16} /> Add</Button>
      </div>

      {message && <div className="message success">{message}</div>}

      {showForm && tab === 'hostels' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); hostelMutation.mutate({ ...hostelForm, school_id: Number(hostelForm.school_id) }); }}>
          <div className="form-grid">
            <label>School<select value={hostelForm.school_id} onChange={(e) => setHostelForm({ ...hostelForm, school_id: e.target.value })} required><option value="">Select</option>{schools?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Name<input value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} required /></label>
            <label>Type<select value={hostelForm.type} onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })}><option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option></select></label>
            <label>Warden<input value={hostelForm.warden_name} onChange={(e) => setHostelForm({ ...hostelForm, warden_name: e.target.value })} /></label>
            <label>Warden Phone<input value={hostelForm.warden_phone} onChange={(e) => setHostelForm({ ...hostelForm, warden_phone: e.target.value })} /></label>
            <label>Address<input value={hostelForm.address} onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })} /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Save Hostel</Button>
        </form>
      )}

      {showForm && tab === 'rooms' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); roomMutation.mutate({ ...roomForm, hostel_id: Number(roomForm.hostel_id), floor: Number(roomForm.floor), capacity: Number(roomForm.capacity) }); }}>
          <div className="form-grid">
            <label>Hostel<select value={roomForm.hostel_id} onChange={(e) => setRoomForm({ ...roomForm, hostel_id: e.target.value })} required><option value="">Select</option>{hostels?.data?.map((h: { id: number; name: string }) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
            <label>Room Number<input value={roomForm.room_number} onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })} required /></label>
            <label>Floor<input type="number" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} /></label>
            <label>Capacity<input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} required /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Save Room</Button>
        </form>
      )}

      {showForm && tab === 'allocations' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); allocMutation.mutate({ ...allocForm, student_id: Number(allocForm.student_id), hostel_room_id: Number(allocForm.hostel_room_id) }); }}>
          <div className="form-grid">
            <label>Student<select value={allocForm.student_id} onChange={(e) => setAllocForm({ ...allocForm, student_id: e.target.value })} required><option value="">Select</option>{students?.data.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}</select></label>
            <label>Room<select value={allocForm.hostel_room_id} onChange={(e) => setAllocForm({ ...allocForm, hostel_room_id: e.target.value })} required><option value="">Select</option>{rooms?.data?.map((r: { id: number; room_number: string; capacity: number; occupied: number; hostel: { name: string } }) => <option key={r.id} value={r.id}>{r.hostel.name} — {r.room_number} ({r.occupied}/{r.capacity})</option>)}</select></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Allocate Student</Button>
        </form>
      )}

      {tab === 'hostels' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Hostel' },
            { key: 'type', header: 'Type', render: (r) => <Badge>{r.type as string}</Badge> },
            { key: 'rooms', header: 'Rooms', render: (r) => String(r.rooms_count ?? 0) },
            { key: 'warden', header: 'Warden', render: (r) => String(r.warden_name ?? '—') },
            { key: 'school', header: 'School', render: (r) => String((r.school as { name: string })?.name ?? '—') },
          ]}
          data={hostels?.data ?? []}
        />
      )}

      {tab === 'rooms' && (
        <DataTable
          columns={[
            { key: 'hostel', header: 'Hostel', render: (r) => String((r.hostel as { name: string })?.name ?? '—') },
            { key: 'room', header: 'Room', render: (r) => String(r.room_number) },
            { key: 'floor', header: 'Floor', render: (r) => String(r.floor ?? '—') },
            { key: 'occupancy', header: 'Occupancy', render: (r) => `${r.occupied}/${r.capacity}` },
          ]}
          data={rooms?.data ?? []}
        />
      )}

      {tab === 'allocations' && (
        <DataTable
          columns={[
            { key: 'student', header: 'Student', render: (r) => String((r.student as { user: { name: string } })?.user?.name ?? '—') },
            { key: 'room', header: 'Room', render: (r) => {
              const room = r.room as { room_number: string; hostel: { name: string } } | undefined;
              return room ? `${room.hostel?.name ?? ''} ${room.room_number}` : '—';
            }},
            { key: 'allocated', header: 'Allocated', render: (r) => new Date(r.allocated_at as string).toLocaleDateString() },
            { key: 'status', header: 'Status', render: (r) => <Badge variant="success">{r.status as string}</Badge> },
            { key: 'action', header: '', render: (r) => r.status === 'active' ? <Button variant="secondary" onClick={() => vacateMutation.mutate(r.id as number)}>Vacate</Button> : null },
          ]}
          data={allocations?.data ?? []}
        />
      )}
    </div>
  );
}
