<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\ClassSection;
use App\Models\Enrollment;
use App\Models\FeePayment;
use App\Models\Grade;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $classes = $this->teacherClasses($user->id);
        $classIds = $classes->pluck('id');

        $attendanceTrend = Attendance::select('date',
            DB::raw("sum(case when status in ('present','late') then 1 else 0 end) as present"),
            DB::raw('count(*) as total'))
            ->whereIn('class_section_id', $classIds)
            ->where('date', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'rate' => $r->total > 0 ? round(($r->present / $r->total) * 100, 1) : 0,
            ]);

        $gradeAvg = Grade::whereIn('class_section_id', $classIds)
            ->select('subject_id', DB::raw('avg(score / max_score * 100) as avg_pct'))
            ->groupBy('subject_id')
            ->with('subject:id,name')
            ->get()
            ->map(fn ($g) => ['subject' => $g->subject->name ?? 'Unknown', 'average' => round($g->avg_pct, 1)]);

        return response()->json([
            'classes' => $classes,
            'total_students' => Enrollment::whereIn('class_section_id', $classIds)->where('status', 'active')->count(),
            'attendance_today' => Attendance::whereIn('class_section_id', $classIds)->whereDate('date', today())->count(),
            'grades_recorded' => Grade::where('recorded_by', $user->id)->count(),
            'attendance_trend' => $attendanceTrend,
            'grade_averages' => $gradeAvg,
            'announcements' => Announcement::where('is_published', true)
                ->where(function ($q) {
                $q->where('target_audience', 'all')->orWhere('target_audience', 'teacher');
            })
                ->latest('published_at')->limit(3)->get(['id', 'title', 'priority', 'published_at']),
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

        return response()->json(['class' => $classSection, 'timetable' => $timetable]);
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

        if (! $this->teacherClasses($request->user()->id)->contains('id', $classSection->id)) {
            abort(403, 'You do not have access to this class.');
        }
    }
}
