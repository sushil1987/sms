import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import './ResourceList.css';

interface Teacher {
  id: number;
  employee_id: string;
  department: string;
  user: { name: string; email: string };
}

interface PaginatedResponse {
  data: Teacher[];
}

export default function Teachers() {
  const { data, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>('/teachers');
      return data;
    },
  });

  return (
    <div className="resource-page">
      <header>
        <h1>Teachers</h1>
      </header>
      {isLoading ? (
        <p>Loading teachers...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.employee_id}</td>
                <td>{teacher.user.name}</td>
                <td>{teacher.user.email}</td>
                <td>{teacher.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
