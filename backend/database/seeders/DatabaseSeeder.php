<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\ClassSection;
use App\Models\Role;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
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

        User::create([
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

        $subjects = collect([
            ['name' => 'Mathematics', 'code' => 'MATH101'],
            ['name' => 'English', 'code' => 'ENG101'],
            ['name' => 'Science', 'code' => 'SCI101'],
            ['name' => 'History', 'code' => 'HIS101'],
        ])->each(fn ($s) => Subject::create($s));

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

        Student::create([
            'user_id' => $studentUser->id,
            'admission_number' => 'STU-2025-001',
            'date_of_birth' => '2010-03-15',
            'gender' => 'male',
            'guardian_name' => 'Robert Doe',
            'guardian_phone' => '+1-555-0200',
            'admission_date' => '2025-09-01',
            'status' => 'active',
        ]);
    }
}
