import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import './ResourceList.css';

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface PaginatedResponse {
  data: Subject[];
}

export default function Subjects() {
  const { data, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>('/subjects');
      return data;
    },
  });

  return (
    <div className="resource-page">
      <header>
        <h1>Subjects</h1>
      </header>
      {isLoading ? (
        <p>Loading subjects...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.code}</td>
                <td>{subject.name}</td>
                <td>{subject.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
