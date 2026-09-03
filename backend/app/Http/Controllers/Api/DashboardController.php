<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;

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
}
