<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\FeePayment;
use App\Models\Grade;
use App\Models\ParentGuardian;
use App\Models\Student;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $parent = $this->getParent($request);

        $children = $parent->students()->with('user')->get();

        $childSummaries = $children->map(function (Student $student) {
            $enrollment = Enrollment::with('classSection')
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->latest()
                ->first();

            $attendance = Attendance::where('student_id', $student->id)
                ->where('date', '>=', now()->subDays(30))
                ->get();
            $present = $attendance->whereIn('status', ['present', 'late'])->count();
            $total = $attendance->count();

            $avgGrade = Grade::where('student_id', $student->id)
                ->get()
                ->avg(fn ($g) => ($g->score / $g->max_score) * 100);

            $feesPaid = FeePayment::where('student_id', $student->id)->sum('amount_paid');

            return [
                'student' => $student,
                'enrollment' => $enrollment,
                'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 1) : null,
                'average_grade' => $avgGrade ? round($avgGrade, 1) : null,
                'fees_paid' => $feesPaid,
            ];
        });

        return response()->json([
            'parent' => $parent->load('user'),
            'children' => $childSummaries,
        ]);
    }

    public function children(Request $request): JsonResponse
    {
        $parent = $this->getParent($request);

        return response()->json($parent->students()->with('user')->get());
    }

    public function childAttendance(Student $student, Request $request): JsonResponse
    {
        $this->authorizeChild($request, $student);

        $records = Attendance::with('classSection')
            ->where('student_id', $student->id)
            ->orderByDesc('date')
            ->paginate(20);

        $chart = Attendance::where('student_id', $student->id)
            ->where('date', '>=', now()->subDays(30))
            ->get()
            ->groupBy(fn ($a) => $a->date->format('M d'))
            ->map(fn ($group, $day) => [
                'day' => $day,
                'present' => $group->whereIn('status', ['present', 'late'])->count(),
                'absent' => $group->where('status', 'absent')->count(),
            ])->values();

        return response()->json([
            'student' => $student->load('user'),
            'chart' => $chart,
            'records' => $records,
        ]);
    }

    public function childGrades(Student $student, Request $request): JsonResponse
    {
        $this->authorizeChild($request, $student);

        $grades = Grade::with(['subject', 'classSection'])
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        $chart = $grades->groupBy(fn ($g) => $g->subject->name)
            ->map(fn ($group, $subject) => [
                'subject' => $subject,
                'average' => round($group->avg(fn ($g) => ($g->score / $g->max_score) * 100), 1),
            ])->values();

        return response()->json([
            'student' => $student->load('user'),
            'grades' => $grades,
            'chart' => $chart,
        ]);
    }

    public function childFees(Student $student, Request $request): JsonResponse
    {
        $this->authorizeChild($request, $student);

        $payments = FeePayment::with('feeStructure')
            ->where('student_id', $student->id)
            ->latest('payment_date')
            ->get();

        return response()->json([
            'student' => $student->load('user'),
            'total_paid' => $payments->sum('amount_paid'),
            'payments' => $payments,
        ]);
    }

    public function childTimetable(Student $student, Request $request): JsonResponse
    {
        $this->authorizeChild($request, $student);

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (! $enrollment) {
            return response()->json(['student' => $student->load('user'), 'timetable' => []]);
        }

        $timetable = Timetable::with(['subject', 'teacher'])
            ->where('class_section_id', $enrollment->class_section_id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->groupBy('day_of_week');

        return response()->json([
            'student' => $student->load('user'),
            'class' => $enrollment->classSection,
            'timetable' => $timetable,
        ]);
    }

    private function getParent(Request $request): ParentGuardian
    {
        $parent = ParentGuardian::where('user_id', $request->user()->id)->first();

        if (! $parent) {
            abort(404, 'Parent profile not found.');
        }

        return $parent;
    }

    private function authorizeChild(Request $request, Student $student): void
    {
        $parent = $this->getParent($request);

        if (! $parent->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'You do not have access to this student.');
        }
    }
}
