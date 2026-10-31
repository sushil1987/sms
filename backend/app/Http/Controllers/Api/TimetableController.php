<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Timetable::with(['classSection', 'subject', 'teacher', 'academicYear']);

        if ($request->filled('class_section_id')) {
            $query->where('class_section_id', $request->integer('class_section_id'));
        }

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->integer('teacher_id'));
        }

        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->integer('academic_year_id'));
        }

        return response()->json(
            $query->orderBy('day_of_week')->orderBy('start_time')->paginate(30)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_section_id' => ['required', 'exists:class_sections,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'day_of_week' => ['required', 'string', 'in:monday,tuesday,wednesday,thursday,friday,saturday'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room' => ['nullable', 'string', 'max:50'],
        ]);

        $timetable = Timetable::create($data);

        return response()->json($timetable->load(['classSection', 'subject', 'teacher']), 201);
    }

    public function show(Timetable $timetable): JsonResponse
    {
        return response()->json($timetable->load(['classSection', 'subject', 'teacher', 'academicYear']));
    }

    public function update(Request $request, Timetable $timetable): JsonResponse
    {
        $data = $request->validate([
            'subject_id' => ['sometimes', 'exists:subjects,id'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'day_of_week' => ['sometimes', 'string', 'in:monday,tuesday,wednesday,thursday,friday,saturday'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'room' => ['nullable', 'string', 'max:50'],
        ]);

        $timetable->update($data);

        return response()->json($timetable->fresh()->load(['classSection', 'subject', 'teacher']));
    }

    public function destroy(Timetable $timetable): JsonResponse
    {
        $timetable->delete();

        return response()->json(['message' => 'Timetable entry deleted successfully.']);
    }
}
