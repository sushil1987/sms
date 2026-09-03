<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\ClassSection;
use App\Models\Enrollment;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\ParentGuardian;
use App\Models\Role;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\User;
use App\Models\UserNotification;
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
        ])->map(fn ($role) => Role::create($role));

        $adminRole = $roles->firstWhere('slug', 'admin');
        $teacherRole = $roles->firstWhere('slug', 'teacher');
        $studentRole = $roles->firstWhere('slug', 'student');
        $parentRole = $roles->firstWhere('slug', 'parent');

        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@school.local',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'phone' => '+1-555-0100',
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
            'employee_id' => 'TCH-001',
            'department' => 'Science',
            'qualification' => 'M.Ed',
            'hire_date' => '2020-08-15',
            'phone' => '+1-555-0101',
        ]);

        $classSection = ClassSection::create([
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
    }
}
