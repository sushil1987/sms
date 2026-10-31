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
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $currentYear = AcademicYear::where('is_current', true)->first();

        return response()->json([
            'students' => Student::where('status', 'active')->count(),
            'teachers' => Teacher::count(),
            'classes' => ClassSection::when($currentYear, fn ($q) => $q->where('academic_year_id', $currentYear->id))->count(),
            'attendance_today' => Attendance::whereDate('date', today())->count(),
            'current_academic_year' => $currentYear,
        ]);
    }

    public function analytics(): JsonResponse
    {
        $attendanceTrend = Attendance::select('date', DB::raw('count(*) as total'),
            DB::raw("sum(case when status in ('present','late') then 1 else 0 end) as present"))
            ->where('date', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'present' => (int) $row->present,
                'absent' => (int) $row->total - (int) $row->present,
            ]);

        $enrollmentByClass = Enrollment::select('class_sections.name', DB::raw('count(*) as count'))
            ->join('class_sections', 'enrollments.class_section_id', '=', 'class_sections.id')
            ->where('enrollments.status', 'active')
            ->groupBy('class_sections.name')
            ->get();

        $gradeDistribution = Grade::select('grade_letter', DB::raw('count(*) as count'))
            ->groupBy('grade_letter')
            ->orderBy('grade_letter')
            ->get();

        $feeMonthly = FeePayment::where('status', 'paid')
            ->where('payment_date', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn ($p) => $p->payment_date->format('M Y'))
            ->map(fn ($group, $month) => [
                'month' => $month,
                'total' => $group->sum('amount_paid'),
            ])
            ->values();

        $recentAnnouncements = Announcement::where('is_published', true)
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'priority', 'published_at']);

        return response()->json([
            'attendance_trend' => $attendanceTrend,
            'enrollment_by_class' => $enrollmentByClass,
            'grade_distribution' => $gradeDistribution,
            'fee_monthly' => $feeMonthly,
            'fee_summary' => [
                'total_collected' => FeePayment::where('status', 'paid')->sum('amount_paid'),
                'this_month' => FeePayment::where('status', 'paid')
                    ->whereMonth('payment_date', now()->month)->sum('amount_paid'),
                'pending' => FeePayment::where('status', 'pending')->count(),
            ],
            'recent_announcements' => $recentAnnouncements,
        ]);
    }
}
