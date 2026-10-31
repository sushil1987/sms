import type { ReactNode } from 'react';
import './ChartCard.css';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}
