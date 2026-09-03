import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import './ResourceList.css';

interface ClassSection {
  id: number;
  name: string;
  grade_level: string;
  section: string;
  capacity: number;
  academic_year: { name: string };
}

interface PaginatedResponse {
  data: ClassSection[];
}

export default function Classes() {
  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>('/classes');
      return data;
    },
  });

  return (
    <div className="resource-page">
      <header>
        <h1>Classes</h1>
      </header>
      {isLoading ? (
        <p>Loading classes...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Section</th>
              <th>Capacity</th>
              <th>Academic Year</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((cls) => (
              <tr key={cls.id}>
                <td>{cls.name}</td>
                <td>{cls.grade_level}</td>
                <td>{cls.section}</td>
                <td>{cls.capacity}</td>
                <td>{cls.academic_year.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
