<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSectionController extends Controller
{
    public function index(): JsonResponse
    {
        $classes = ClassSection::with(['academicYear', 'classTeacher'])
            ->latest()
            ->paginate(15);

        return response()->json($classes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'name' => ['required', 'string', 'max:255'],
            'grade_level' => ['required', 'string', 'max:50'],
            'section' => ['nullable', 'string', 'max:10'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'class_teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        $class = ClassSection::create($data);

        return response()->json($class->load(['academicYear', 'classTeacher']), 201);
    }

    public function show(ClassSection $classSection): JsonResponse
    {
        return response()->json($classSection->load(['academicYear', 'classTeacher', 'enrollments.student.user']));
    }

    public function update(Request $request, ClassSection $classSection): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'grade_level' => ['sometimes', 'string', 'max:50'],
            'section' => ['nullable', 'string', 'max:10'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'class_teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        $classSection->update($data);

        return response()->json($classSection->fresh()->load(['academicYear', 'classTeacher']));
    }

    public function destroy(ClassSection $classSection): JsonResponse
    {
        $classSection->delete();

        return response()->json(['message' => 'Class section deleted successfully.']);
    }
}
