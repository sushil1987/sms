import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, X } from 'lucide-react';
import api from '../lib/api';
import './NotificationBell.css';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  channel: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    refetchInterval: 60000,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = data?.unread_count ?? 0;
  const items: NotificationItem[] = data?.notifications?.data ?? [];

  return (
    <div className="notification-bell">
      <button type="button" className="bell-btn" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Bell size={20} />
        {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <>
          <div className="bell-overlay" onClick={() => setOpen(false)} />
          <div className="bell-dropdown">
            <div className="bell-header">
              <h4>Notifications</h4>
              <div className="bell-actions">
                {unread > 0 && (
                  <button type="button" onClick={() => markAllRead.mutate()} title="Mark all read">
                    <Check size={16} />
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)}><X size={16} /></button>
              </div>
            </div>
            <div className="bell-list">
              {items.length === 0 ? (
                <p className="bell-empty">No notifications</p>
              ) : items.map((n) => (
                <div
                  key={n.id}
                  className={`bell-item ${n.is_read ? '' : 'unread'}`}
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                >
                  <div className="bell-item-type">{n.type}</div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small>{new Date(n.created_at).toLocaleString()}</small>
                  {n.channel.includes('sms') && <span className="channel-tag">SMS</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
