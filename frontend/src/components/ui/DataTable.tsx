import type { ReactNode } from 'react';
import './DataTable.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  if (!data.length) {
    return <div className="data-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={String(row[keyField] ?? i)}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
