<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Grade::with(['student.user', 'subject', 'classSection', 'academicYear', 'recordedBy']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        if ($request->filled('class_section_id')) {
            $query->where('class_section_id', $request->integer('class_section_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->integer('subject_id'));
        }

        if ($request->filled('exam_type')) {
            $query->where('exam_type', $request->string('exam_type'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'class_section_id' => ['required', 'exists:class_sections,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'exam_type' => ['required', 'string', 'max:50'],
            'score' => ['required', 'numeric', 'min:0'],
            'max_score' => ['nullable', 'numeric', 'min:1'],
            'grade_letter' => ['nullable', 'string', 'max:5'],
            'remarks' => ['nullable', 'string'],
        ]);

        $maxScore = $data['max_score'] ?? 100;
        $percentage = ($data['score'] / $maxScore) * 100;

        $grade = Grade::create([
            ...$data,
            'max_score' => $maxScore,
            'grade_letter' => $data['grade_letter'] ?? $this->letterGrade($percentage),
            'recorded_by' => $request->user()->id,
        ]);

        return response()->json($grade->load(['student.user', 'subject', 'classSection']), 201);
    }

    public function show(Grade $grade): JsonResponse
    {
        return response()->json($grade->load(['student.user', 'subject', 'classSection', 'academicYear']));
    }

    public function update(Request $request, Grade $grade): JsonResponse
    {
        $data = $request->validate([
            'exam_type' => ['sometimes', 'string', 'max:50'],
            'score' => ['sometimes', 'numeric', 'min:0'],
            'max_score' => ['nullable', 'numeric', 'min:1'],
            'grade_letter' => ['nullable', 'string', 'max:5'],
            'remarks' => ['nullable', 'string'],
        ]);

        if (isset($data['score']) || isset($data['max_score'])) {
            $score = $data['score'] ?? $grade->score;
            $maxScore = $data['max_score'] ?? $grade->max_score;
            $data['grade_letter'] = $data['grade_letter'] ?? $this->letterGrade(($score / $maxScore) * 100);
        }

        $grade->update($data);

        return response()->json($grade->fresh()->load(['student.user', 'subject', 'classSection']));
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $grade->delete();

        return response()->json(['message' => 'Grade deleted successfully.']);
    }

    public function reportCard(Student $student, Request $request): JsonResponse
    {
        $academicYearId = $request->integer('academic_year_id');

        $query = Grade::with(['subject', 'classSection', 'academicYear'])
            ->where('student_id', $student->id);

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $grades = $query->get()->groupBy('subject.name');

        $summary = $grades->map(function ($subjectGrades, $subjectName) {
            $avg = $subjectGrades->avg(fn ($g) => ($g->score / $g->max_score) * 100);

            return [
                'subject' => $subjectName,
                'grades' => $subjectGrades,
                'average_percentage' => round($avg, 1),
            ];
        })->values();

        return response()->json([
            'student' => $student->load('user'),
            'subjects' => $summary,
            'overall_average' => $summary->avg('average_percentage') ? round($summary->avg('average_percentage'), 1) : 0,
        ]);
    }

    private function letterGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'A',
            $percentage >= 80 => 'B',
            $percentage >= 70 => 'C',
            $percentage >= 60 => 'D',
            default => 'F',
        };
    }
}
