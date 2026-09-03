<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\ClassSection;
use App\Models\Enrollment;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\Hostel;
use App\Models\HostelAllocation;
use App\Models\HostelRoom;
use App\Models\ParentGuardian;
use App\Models\Role;
use App\Models\School;
use App\Models\Student;
use App\Models\StudentTransport;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\TransportRoute;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\NotificationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roles = collect([
            ['name' => 'Administrator', 'slug' => 'admin', 'description' => 'Full system access'],
            ['name' => 'Teacher', 'slug' => 'teacher', 'description' => 'Manage classes, attendance, and grades'],
            ['name' => 'Student', 'slug' => 'student', 'description' => 'View own records'],
            ['name' => 'Parent', 'slug' => 'parent', 'description' => 'View child records'],
            ['name' => 'Principal', 'slug' => 'principal', 'description' => 'Manage teachers, classes, and staff assignments'],
            ['name' => 'Accountant', 'slug' => 'accountant', 'description' => 'Collect fees and track payments'],
        ])->map(fn ($role) => Role::create($role));

        $adminRole = $roles->firstWhere('slug', 'admin');
        $teacherRole = $roles->firstWhere('slug', 'teacher');
        $studentRole = $roles->firstWhere('slug', 'student');
        $parentRole = $roles->firstWhere('slug', 'parent');
        $principalRole = $roles->firstWhere('slug', 'principal');
        $accountantRole = $roles->firstWhere('slug', 'accountant');

        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@school.local',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'phone' => '+1-555-0100',
        ]);

        User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'principal@school.local',
            'password' => Hash::make('password'),
            'role_id' => $principalRole->id,
            'phone' => '+1-555-0150',
        ]);

        User::create([
            'name' => 'Mary Williams',
            'email' => 'accountant@school.local',
            'password' => Hash::make('password'),
            'role_id' => $accountantRole->id,
            'phone' => '+1-555-0160',
        ]);

        $school = School::create([
            'name' => 'EduSphere Academy',
            'code' => 'EDU001',
            'email' => 'info@edusphere.edu',
            'phone' => '+1-555-1000',
            'address' => '123 Education Lane',
            'city' => 'Springfield',
            'principal_name' => 'Dr. Sarah Johnson',
            'is_active' => true,
        ]);

        School::create([
            'name' => 'Riverside High School',
            'code' => 'RHS002',
            'email' => 'admin@riverside.edu',
            'phone' => '+1-555-2000',
            'address' => '456 River Road',
            'city' => 'Riverside',
            'principal_name' => 'Mr. James Wilson',
            'is_active' => true,
        ]);

        $academicYear = AcademicYear::create([
            'name' => '2025-2026',
            'start_date' => '2025-09-01',
            'end_date' => '2026-06-30',
            'is_current' => true,
        ]);

        $math = Subject::create(['name' => 'Mathematics', 'code' => 'MATH101']);
        $english = Subject::create(['name' => 'English', 'code' => 'ENG101']);
        Subject::create(['name' => 'Science', 'code' => 'SCI101']);
        Subject::create(['name' => 'History', 'code' => 'HIS101']);

        $teacherUser = User::create([
            'name' => 'Jane Smith',
            'email' => 'teacher@school.local',
            'password' => Hash::make('password'),
            'role_id' => $teacherRole->id,
            'phone' => '+1-555-0101',
        ]);

        Teacher::create([
            'user_id' => $teacherUser->id,
            'school_id' => $school->id,
            'employee_id' => 'TCH-001',
            'department' => 'Science',
            'qualification' => 'M.Ed',
            'hire_date' => '2020-08-15',
            'phone' => '+1-555-0101',
        ]);

        $classSection = ClassSection::create([
            'school_id' => $school->id,
            'academic_year_id' => $academicYear->id,
            'name' => 'Grade 10 - A',
            'grade_level' => '10',
            'section' => 'A',
            'capacity' => 35,
            'class_teacher_id' => $teacherUser->id,
        ]);

        $studentUser = User::create([
            'name' => 'John Doe',
            'email' => 'student@school.local',
            'password' => Hash::make('password'),
            'role_id' => $studentRole->id,
        ]);

        $student = Student::create([
            'user_id' => $studentUser->id,
            'school_id' => $school->id,
            'admission_number' => 'STU-2025-001',
            'date_of_birth' => '2010-03-15',
            'gender' => 'male',
            'guardian_name' => 'Robert Doe',
            'guardian_phone' => '+1-555-0200',
            'admission_date' => '2025-09-01',
            'status' => 'active',
        ]);

        Enrollment::create([
            'student_id' => $student->id,
            'class_section_id' => $classSection->id,
            'academic_year_id' => $academicYear->id,
            'enrolled_at' => '2025-09-01',
            'status' => 'active',
        ]);

        Timetable::create([
            'class_section_id' => $classSection->id,
            'subject_id' => $math->id,
            'teacher_id' => $teacherUser->id,
            'academic_year_id' => $academicYear->id,
            'day_of_week' => 'monday',
            'start_time' => '09:00',
            'end_time' => '09:45',
            'room' => 'Room 101',
        ]);

        Timetable::create([
            'class_section_id' => $classSection->id,
            'subject_id' => $english->id,
            'teacher_id' => $teacherUser->id,
            'academic_year_id' => $academicYear->id,
            'day_of_week' => 'monday',
            'start_time' => '10:00',
            'end_time' => '10:45',
            'room' => 'Room 101',
        ]);

        for ($i = 0; $i < 10; $i++) {
            Attendance::create([
                'student_id' => $student->id,
                'class_section_id' => $classSection->id,
                'date' => now()->subDays($i)->toDateString(),
                'status' => $i % 5 === 0 ? 'absent' : 'present',
                'recorded_by' => $teacherUser->id,
            ]);
        }

        Grade::create([
            'student_id' => $student->id,
            'subject_id' => $math->id,
            'class_section_id' => $classSection->id,
            'academic_year_id' => $academicYear->id,
            'exam_type' => 'Midterm',
            'score' => 88,
            'max_score' => 100,
            'grade_letter' => 'B',
            'recorded_by' => $teacherUser->id,
        ]);

        Grade::create([
            'student_id' => $student->id,
            'subject_id' => $english->id,
            'class_section_id' => $classSection->id,
            'academic_year_id' => $academicYear->id,
            'exam_type' => 'Midterm',
            'score' => 92,
            'max_score' => 100,
            'grade_letter' => 'A',
            'recorded_by' => $teacherUser->id,
        ]);

        $tuition = FeeStructure::create([
            'name' => 'Annual Tuition',
            'academic_year_id' => $academicYear->id,
            'grade_level' => '10',
            'amount' => 5000.00,
            'due_date' => '2025-10-01',
            'description' => 'Annual tuition fee for Grade 10',
            'is_active' => true,
        ]);

        FeePayment::create([
            'student_id' => $student->id,
            'fee_structure_id' => $tuition->id,
            'amount_paid' => 2500.00,
            'payment_date' => now()->subDays(5)->toDateString(),
            'payment_method' => 'bank_transfer',
            'status' => 'paid',
            'receipt_number' => 'RCP-SEED0001',
            'recorded_by' => $admin->id,
        ]);

        Announcement::create([
            'title' => 'Welcome to the New Academic Year',
            'body' => 'We are excited to welcome all students and staff to the 2025-2026 academic year. Classes begin September 1st.',
            'target_audience' => 'all',
            'priority' => 'high',
            'is_published' => true,
            'published_at' => now()->subDays(2),
            'published_by' => $admin->id,
        ]);

        Announcement::create([
            'title' => 'Parent-Teacher Meeting',
            'body' => 'Parent-teacher meetings are scheduled for next Friday. Please check your class timetable.',
            'target_audience' => 'all',
            'priority' => 'normal',
            'is_published' => true,
            'published_at' => now()->subDay(),
            'published_by' => $admin->id,
        ]);

        $parentUser = User::create([
            'name' => 'Robert Doe',
            'email' => 'parent@school.local',
            'password' => Hash::make('password'),
            'role_id' => $parentRole->id,
            'phone' => '+1-555-0200',
        ]);

        $parent = ParentGuardian::create([
            'user_id' => $parentUser->id,
            'relationship' => 'father',
            'occupation' => 'Engineer',
        ]);

        $parent->students()->attach($student->id, ['is_primary' => true]);

        NotificationService::send(
            $parentUser,
            'welcome',
            'Welcome to EduSphere Parent Portal',
            'You can now track John Doe\'s attendance, grades, and fees from your dashboard.',
            ['student_id' => $student->id],
        );

        NotificationService::send(
            $parentUser,
            'attendance',
            'Attendance Alert',
            'John Doe was marked absent on '.now()->subDays(5)->format('M d, Y').'.',
            ['student_id' => $student->id],
            ['in_app', 'email', 'sms'],
        );

        $mathBook = Book::create([
            'school_id' => $school->id,
            'title' => 'Advanced Mathematics',
            'author' => 'John Stewart',
            'isbn' => '978-0-123456-78-9',
            'category' => 'Mathematics',
            'total_copies' => 10,
            'available_copies' => 9,
            'shelf_location' => 'A-101',
        ]);

        Book::create([
            'school_id' => $school->id,
            'title' => 'English Literature Classics',
            'author' => 'Various',
            'isbn' => '978-0-987654-32-1',
            'category' => 'Literature',
            'total_copies' => 8,
            'available_copies' => 8,
            'shelf_location' => 'B-205',
        ]);

        Book::create([
            'school_id' => $school->id,
            'title' => 'Introduction to Physics',
            'author' => 'Dr. Helen Park',
            'isbn' => '978-0-555555-55-5',
            'category' => 'Science',
            'total_copies' => 6,
            'available_copies' => 6,
            'shelf_location' => 'C-310',
        ]);

        BookIssue::create([
            'book_id' => $mathBook->id,
            'student_id' => $student->id,
            'issued_at' => now()->subDays(3)->toDateString(),
            'due_date' => now()->addDays(11)->toDateString(),
            'status' => 'issued',
            'issued_by' => $admin->id,
        ]);

        $route = TransportRoute::create([
            'school_id' => $school->id,
            'name' => 'North Campus Route',
            'description' => 'Covers northern suburbs',
            'monthly_fare' => 75.00,
            'stops' => ['Main Gate', 'Oak Street', 'Park Avenue', 'School'],
            'is_active' => true,
        ]);

        $vehicle = Vehicle::create([
            'transport_route_id' => $route->id,
            'vehicle_number' => 'BUS-101',
            'driver_name' => 'Mike Johnson',
            'driver_phone' => '+1-555-0300',
            'capacity' => 40,
            'is_active' => true,
        ]);

        StudentTransport::create([
            'student_id' => $student->id,
            'transport_route_id' => $route->id,
            'vehicle_id' => $vehicle->id,
            'pickup_point' => 'Oak Street',
            'status' => 'active',
        ]);

        $hostel = Hostel::create([
            'school_id' => $school->id,
            'name' => 'Boys Hostel Block A',
            'type' => 'boys',
            'address' => 'Campus North Wing',
            'warden_name' => 'Mr. David Lee',
            'warden_phone' => '+1-555-0400',
            'is_active' => true,
        ]);

        $room = HostelRoom::create([
            'hostel_id' => $hostel->id,
            'room_number' => 'A-201',
            'floor' => 2,
            'capacity' => 4,
            'occupied' => 1,
        ]);

        HostelRoom::create([
            'hostel_id' => $hostel->id,
            'room_number' => 'A-202',
            'floor' => 2,
            'capacity' => 4,
            'occupied' => 0,
        ]);

        HostelAllocation::create([
            'student_id' => $student->id,
            'hostel_room_id' => $room->id,
            'allocated_at' => '2025-09-01',
            'status' => 'active',
        ]);
    }
}
