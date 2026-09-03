import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bus, Plus, MapPin } from 'lucide-react';
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

export default function Transport() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'routes' | 'vehicles' | 'assignments'>('routes');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [routeForm, setRouteForm] = useState({ school_id: '', name: '', description: '', monthly_fare: '' });
  const [vehicleForm, setVehicleForm] = useState({ transport_route_id: '', vehicle_number: '', driver_name: '', driver_phone: '', capacity: '40' });
  const [assignForm, setAssignForm] = useState({ student_id: '', transport_route_id: '', vehicle_id: '', pickup_point: '' });

  const { data: overview } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: async () => (await api.get('/reports/overview')).data,
  });

  const { data: transportReport } = useQuery({
    queryKey: ['reports-transport'],
    queryFn: async () => (await api.get('/reports/transport')).data,
  });

  const { data: routes } = useQuery({
    queryKey: ['transport-routes'],
    queryFn: async () => (await api.get('/transport-routes')).data,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => (await api.get('/vehicles')).data,
  });

  const { data: assignments } = useQuery({
    queryKey: ['student-transports'],
    queryFn: async () => (await api.get('/student-transports')).data,
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => (await api.get<School[]>('/schools')).data,
  });

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => (await api.get<PaginatedResponse<Student>>('/students')).data,
  });

  const routeMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/transport-routes', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transport-routes', 'reports-overview', 'reports-transport'] }); setShowForm(false); setMessage('Route created.'); },
  });

  const vehicleMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/vehicles', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vehicles'] }); setShowForm(false); setMessage('Vehicle added.'); },
  });

  const assignMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/student-transports', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['student-transports', 'reports-overview'] }); setShowForm(false); setMessage('Student assigned to route.'); },
  });

  const transport = overview?.transport;

  return (
    <div>
      <PageHeader title="Transport" subtitle="Routes, vehicles, and student assignments" />

      <div className="stat-grid">
        <StatCard title="Active Routes" value={transport?.routes ?? 0} icon={MapPin} color="sky" />
        <StatCard title="Vehicles" value={transport?.vehicles ?? 0} icon={Bus} color="emerald" />
        <StatCard title="Students" value={transport?.students ?? 0} icon={Bus} color="indigo" />
        <StatCard title="Monthly Revenue" value={`$${Number(transportReport?.revenue_potential ?? 0).toLocaleString()}`} icon={Bus} color="amber" />
      </div>

      <ChartCard title="Students per Route" subtitle="Route utilization">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={transportReport?.routes ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a2234', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8 }} />
            <Bar dataKey="students" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="tabs" style={{ marginTop: '1.5rem' }}>
        <button type="button" className={tab === 'routes' ? 'active' : ''} onClick={() => setTab('routes')}>Routes</button>
        <button type="button" className={tab === 'vehicles' ? 'active' : ''} onClick={() => setTab('vehicles')}>Vehicles</button>
        <button type="button" className={tab === 'assignments' ? 'active' : ''} onClick={() => setTab('assignments')}>Assignments</button>
        <Button onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto' }}><Plus size={16} /> Add</Button>
      </div>

      {message && <div className="message success">{message}</div>}

      {showForm && tab === 'routes' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); routeMutation.mutate({ ...routeForm, school_id: Number(routeForm.school_id), monthly_fare: Number(routeForm.monthly_fare) }); }}>
          <div className="form-grid">
            <label>School<select value={routeForm.school_id} onChange={(e) => setRouteForm({ ...routeForm, school_id: e.target.value })} required><option value="">Select</option>{schools?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Route Name<input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} required /></label>
            <label>Description<input value={routeForm.description} onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })} /></label>
            <label>Monthly Fare<input type="number" value={routeForm.monthly_fare} onChange={(e) => setRouteForm({ ...routeForm, monthly_fare: e.target.value })} required /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Save Route</Button>
        </form>
      )}

      {showForm && tab === 'vehicles' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); vehicleMutation.mutate({ ...vehicleForm, transport_route_id: Number(vehicleForm.transport_route_id), capacity: Number(vehicleForm.capacity) }); }}>
          <div className="form-grid">
            <label>Route<select value={vehicleForm.transport_route_id} onChange={(e) => setVehicleForm({ ...vehicleForm, transport_route_id: e.target.value })} required><option value="">Select</option>{routes?.data?.map((r: { id: number; name: string }) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label>Vehicle Number<input value={vehicleForm.vehicle_number} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} required /></label>
            <label>Driver Name<input value={vehicleForm.driver_name} onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })} required /></label>
            <label>Driver Phone<input value={vehicleForm.driver_phone} onChange={(e) => setVehicleForm({ ...vehicleForm, driver_phone: e.target.value })} /></label>
            <label>Capacity<input type="number" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} required /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Save Vehicle</Button>
        </form>
      )}

      {showForm && tab === 'assignments' && (
        <form className="form-card" onSubmit={(e) => { e.preventDefault(); assignMutation.mutate({ ...assignForm, student_id: Number(assignForm.student_id), transport_route_id: Number(assignForm.transport_route_id), vehicle_id: assignForm.vehicle_id ? Number(assignForm.vehicle_id) : null }); }}>
          <div className="form-grid">
            <label>Student<select value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} required><option value="">Select</option>{students?.data.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}</select></label>
            <label>Route<select value={assignForm.transport_route_id} onChange={(e) => setAssignForm({ ...assignForm, transport_route_id: e.target.value })} required><option value="">Select</option>{routes?.data?.map((r: { id: number; name: string }) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label>Vehicle<select value={assignForm.vehicle_id} onChange={(e) => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}><option value="">Optional</option>{vehicles?.data?.map((v: { id: number; vehicle_number: string }) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}</select></label>
            <label>Pickup Point<input value={assignForm.pickup_point} onChange={(e) => setAssignForm({ ...assignForm, pickup_point: e.target.value })} /></label>
          </div>
          <Button type="submit" style={{ marginTop: '1rem' }}>Assign Student</Button>
        </form>
      )}

      {tab === 'routes' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Route' },
            { key: 'fare', header: 'Monthly Fare', render: (r) => `$${Number(r.monthly_fare).toFixed(2)}` },
            { key: 'students', header: 'Students', render: (r) => String(r.student_transports_count ?? 0) },
            { key: 'school', header: 'School', render: (r) => String((r.school as { name: string })?.name ?? '—') },
            { key: 'status', header: 'Status', render: (r) => r.is_active ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge> },
          ]}
          data={routes?.data ?? []}
        />
      )}

      {tab === 'vehicles' && (
        <DataTable
          columns={[
            { key: 'number', header: 'Vehicle', render: (r) => String(r.vehicle_number) },
            { key: 'driver', header: 'Driver', render: (r) => String(r.driver_name) },
            { key: 'capacity', header: 'Capacity' },
            { key: 'route', header: 'Route', render: (r) => String((r.route as { name: string })?.name ?? '—') },
            { key: 'status', header: 'Status', render: (r) => r.is_active ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge> },
          ]}
          data={vehicles?.data ?? []}
        />
      )}

      {tab === 'assignments' && (
        <DataTable
          columns={[
            { key: 'student', header: 'Student', render: (r) => String((r.student as { user: { name: string } })?.user?.name ?? '—') },
            { key: 'route', header: 'Route', render: (r) => String((r.route as { name: string })?.name ?? '—') },
            { key: 'vehicle', header: 'Vehicle', render: (r) => String((r.vehicle as { vehicle_number: string })?.vehicle_number ?? '—') },
            { key: 'pickup', header: 'Pickup', render: (r) => String(r.pickup_point ?? '—') },
            { key: 'status', header: 'Status', render: (r) => <Badge variant="success">{r.status as string}</Badge> },
          ]}
          data={assignments?.data ?? []}
        />
      )}
    </div>
  );
}
