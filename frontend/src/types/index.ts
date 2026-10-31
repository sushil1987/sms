export interface School {
  id: number;
  name: string;
  code: string;
  city?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface Student {
  id: number;
  admission_number: string;
  status: string;
  user: UserSummary;
}

export interface ClassSection {
  id: number;
  name: string;
  grade_level: string;
  section: string;
  capacity: number;
  academic_year?: { id: number; name: string };
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  is_current: boolean;
}

export interface Enrollment {
  id: number;
  student_id: number;
  class_section_id: number;
  academic_year_id: number;
  enrolled_at: string;
  status: string;
  student: Student;
  class_section: ClassSection;
  academic_year: AcademicYear;
}

export interface TimetableEntry {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  subject: Subject;
  teacher?: UserSummary;
  class_section?: ClassSection;
}

export interface Grade {
  id: number;
  exam_type: string;
  score: number;
  max_score: number;
  grade_letter: string;
  student: Student;
  subject: Subject;
  class_section: ClassSection;
}
