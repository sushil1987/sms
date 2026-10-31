<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\FeePayment;
use App\Models\Grade;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $enrollment = Enrollment::with('classSection')
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        $classSectionId = $enrollment?->class_section_id;

        $attendance = $classSectionId
            ? Attendance::where('student_id', $student->id)
                ->where('class_section_id', $classSectionId)
                ->where('date', '>=', now()->subDays(30))
                ->get()
            : collect();

        $present = $attendance->whereIn('status', ['present', 'late'])->count();
        $total = $attendance->count();

        $attendanceChart = $attendance->groupBy(fn ($a) => $a->date->format('M d'))
            ->map(fn ($group, $day) => [
                'day' => $day,
                'status' => $group->first()->status === 'absent' ? 0 : 1,
            ])->values();

        $grades = Grade::with('subject')
            ->where('student_id', $student->id)
            ->get()
            ->map(fn ($g) => [
                'subject' => $g->subject->name,
                'percentage' => round(($g->score / $g->max_score) * 100, 1),
            ]);

        $feesPaid = FeePayment::where('student_id', $student->id)->sum('amount_paid');

        return response()->json([
            'student' => $student->load('user'),
            'enrollment' => $enrollment,
            'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 1) : null,
            'attendance_chart' => $attendanceChart,
            'grade_chart' => $grades,
            'fees_paid' => $feesPaid,
            'recent_grades' => Grade::with('subject')
                ->where('student_id', $student->id)
                ->latest()
                ->limit(5)
                ->get(),
            'announcements' => Announcement::where('is_published', true)
                ->where(function ($q) {
                $q->where('target_audience', 'all')->orWhere('target_audience', 'student');
            })
                ->latest('published_at')->limit(3)->get(['id', 'title', 'body', 'priority', 'published_at']),
        ]);
    }

    public function attendance(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (! $student) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        return response()->json(
            Attendance::with('classSection')
                ->where('student_id', $student->id)
                ->orderByDesc('date')
                ->paginate(20)
        );
    }

    public function grades(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (! $student) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        return response()->json(
            Grade::with(['subject', 'classSection', 'academicYear'])
                ->where('student_id', $student->id)
                ->latest()
                ->paginate(20)
        );
    }

    public function timetable(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (! $student) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (! $enrollment) {
            return response()->json(['message' => 'No active enrollment found.', 'timetable' => []]);
        }

        $timetable = Timetable::with(['subject', 'teacher'])
            ->where('class_section_id', $enrollment->class_section_id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->groupBy('day_of_week');

        return response()->json(['class' => $enrollment->classSection, 'timetable' => $timetable]);
    }
}
