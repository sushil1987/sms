<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\ClassSection;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $classes = $this->teacherClasses($user->id);

        $classIds = $classes->pluck('id');
        $studentCount = Enrollment::whereIn('class_section_id', $classIds)
            ->where('status', 'active')
            ->count();

        return response()->json([
            'classes' => $classes,
            'total_students' => $studentCount,
            'attendance_today' => Attendance::whereIn('class_section_id', $classIds)
                ->whereDate('date', today())
                ->count(),
            'grades_recorded' => Grade::where('recorded_by', $user->id)->count(),
        ]);
    }

    public function classes(Request $request): JsonResponse
    {
        return response()->json($this->teacherClasses($request->user()->id));
    }

    public function classStudents(ClassSection $classSection, Request $request): JsonResponse
    {
        $this->authorizeClassAccess($request, $classSection);

        $students = Enrollment::with('student.user')
            ->where('class_section_id', $classSection->id)
            ->where('status', 'active')
            ->get()
            ->pluck('student');

        return response()->json([
            'class' => $classSection->load(['academicYear', 'classTeacher']),
            'students' => $students,
        ]);
    }

    public function classTimetable(ClassSection $classSection, Request $request): JsonResponse
    {
        $this->authorizeClassAccess($request, $classSection);

        $timetable = Timetable::with(['subject', 'teacher'])
            ->where('class_section_id', $classSection->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->groupBy('day_of_week');

        return response()->json([
            'class' => $classSection,
            'timetable' => $timetable,
        ]);
    }

    private function teacherClasses(int $userId)
    {
        $currentYear = AcademicYear::where('is_current', true)->first();

        $asClassTeacher = ClassSection::with('academicYear')
            ->where('class_teacher_id', $userId)
            ->when($currentYear, fn ($q) => $q->where('academic_year_id', $currentYear->id))
            ->get();

        $fromTimetable = ClassSection::with('academicYear')
            ->whereIn('id', Timetable::where('teacher_id', $userId)->pluck('class_section_id'))
            ->when($currentYear, fn ($q) => $q->where('academic_year_id', $currentYear->id))
            ->get();

        return $asClassTeacher->merge($fromTimetable)->unique('id')->values();
    }

    private function authorizeClassAccess(Request $request, ClassSection $classSection): void
    {
        if ($request->user()->hasRole('admin')) {
            return;
        }

        if (! $request->user()->hasRole('teacher')) {
            abort(403, 'Forbidden.');
        }

        $allowed = $this->teacherClasses($request->user()->id)
            ->contains('id', $classSection->id);

        if (! $allowed) {
            abort(403, 'You do not have access to this class.');
        }
    }
}
