import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import './ResourceList.css';

interface Student {
  id: number;
  admission_number: string;
  status: string;
  user: { name: string; email: string };
}

interface PaginatedResponse {
  data: Student[];
}

export default function Students() {
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>('/students');
      return data;
    },
  });

  return (
    <div className="resource-page">
      <header>
        <h1>Students</h1>
      </header>
      {isLoading ? (
        <p>Loading students...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Admission #</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((student) => (
              <tr key={student.id}>
                <td>{student.admission_number}</td>
                <td>{student.user.name}</td>
                <td>{student.user.email}</td>
                <td>
                  <span className={`status status-${student.status}`}>
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
