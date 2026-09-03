<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\ClassSection;
use App\Models\Teacher;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PrincipalPortalController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $classes = ClassSection::with(['classTeacher', 'academicYear'])->get();

        return response()->json([
            'teachers' => Teacher::count(),
            'classes' => $classes->count(),
            'unassigned_classes' => $classes->whereNull('class_teacher_id')->count(),
            'timetable_entries' => Timetable::count(),
            'teachers_by_department' => Teacher::select('department', DB::raw('count(*) as count'))
                ->groupBy('department')
                ->get()
                ->map(fn ($row) => [
                    'department' => $row->department ?: 'Unassigned',
                    'count' => (int) $row->count,
                ]),
            'class_assignments' => $classes->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'grade_level' => $c->grade_level,
                'class_teacher' => $c->classTeacher?->name,
                'academic_year' => $c->academicYear?->name,
            ]),
            'announcements' => Announcement::where('is_published', true)
                ->latest('published_at')
                ->limit(5)
                ->get(['id', 'title', 'priority', 'published_at']),
        ]);
    }
}
