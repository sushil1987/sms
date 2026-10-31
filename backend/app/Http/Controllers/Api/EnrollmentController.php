<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Enrollment::with(['student.user', 'classSection', 'academicYear']);

        if ($request->filled('class_section_id')) {
            $query->where('class_section_id', $request->integer('class_section_id'));
        }

        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->integer('academic_year_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'class_section_id' => ['required', 'exists:class_sections,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'enrolled_at' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:active,inactive,transferred'],
        ]);

        $enrollment = Enrollment::create([
            ...$data,
            'enrolled_at' => $data['enrolled_at'] ?? now()->toDateString(),
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json($enrollment->load(['student.user', 'classSection', 'academicYear']), 201);
    }

    public function show(Enrollment $enrollment): JsonResponse
    {
        return response()->json($enrollment->load(['student.user', 'classSection', 'academicYear']));
    }

    public function update(Request $request, Enrollment $enrollment): JsonResponse
    {
        $data = $request->validate([
            'class_section_id' => ['sometimes', 'exists:class_sections,id'],
            'status' => ['sometimes', 'string', 'in:active,inactive,transferred'],
        ]);

        $enrollment->update($data);

        return response()->json($enrollment->fresh()->load(['student.user', 'classSection', 'academicYear']));
    }

    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();

        return response()->json(['message' => 'Enrollment removed successfully.']);
    }
}
