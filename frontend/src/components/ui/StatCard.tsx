import type { LucideIcon } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const colorMap = {
  indigo: 'stat-indigo',
  emerald: 'stat-emerald',
  amber: 'stat-amber',
  rose: 'stat-rose',
  sky: 'stat-sky',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'indigo' }: StatCardProps) {
  return (
    <div className={`stat-card ${colorMap[color]}`}>
      <div className="stat-card-icon">
        <Icon size={22} />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
        {trend && <span className="stat-card-trend">{trend}</span>}
      </div>
    </div>
  );
}
