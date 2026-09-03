<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_section_id' => ['nullable', 'exists:class_sections,id'],
            'student_id' => ['nullable', 'exists:students,id'],
            'date' => ['nullable', 'date'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = Attendance::with(['student.user', 'classSection', 'recordedBy']);

        if (! empty($data['class_section_id'])) {
            $query->where('class_section_id', $data['class_section_id']);
        }

        if (! empty($data['student_id'])) {
            $query->where('student_id', $data['student_id']);
        }

        if (! empty($data['date'])) {
            $query->whereDate('date', $data['date']);
        }

        if (! empty($data['from'])) {
            $query->whereDate('date', '>=', $data['from']);
        }

        if (! empty($data['to'])) {
            $query->whereDate('date', '<=', $data['to']);
        }

        return response()->json($query->orderByDesc('date')->paginate(20));
    }

    public function classSheet(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_section_id' => ['required', 'exists:class_sections,id'],
            'date' => ['required', 'date'],
        ]);

        $enrolledStudents = Enrollment::with('student.user')
            ->where('class_section_id', $data['class_section_id'])
            ->where('status', 'active')
            ->get()
            ->pluck('student');

        $existing = Attendance::where('class_section_id', $data['class_section_id'])
            ->whereDate('date', $data['date'])
            ->get()
            ->keyBy('student_id');

        $sheet = $enrolledStudents->map(function ($student) use ($existing) {
            $record = $existing->get($student->id);

            return [
                'student' => $student->load('user'),
                'attendance' => $record,
                'status' => $record?->status,
            ];
        });

        return response()->json([
            'date' => $data['date'],
            'class_section_id' => $data['class_section_id'],
            'students' => $sheet,
        ]);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_section_id' => ['required', 'exists:class_sections,id'],
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'exists:students,id'],
            'records.*.status' => ['required', 'string', 'in:present,absent,late,excused'],
            'records.*.remarks' => ['nullable', 'string'],
        ]);

        $userId = $request->user()->id;

        DB::transaction(function () use ($data, $userId) {
            foreach ($data['records'] as $record) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'date' => $data['date'],
                    ],
                    [
                        'class_section_id' => $data['class_section_id'],
                        'status' => $record['status'],
                        'remarks' => $record['remarks'] ?? null,
                        'recorded_by' => $userId,
                    ]
                );
            }
        });

        return response()->json(['message' => 'Attendance saved successfully.']);
    }

    public function report(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_section_id' => ['required', 'exists:class_sections,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $from = $data['from'] ?? now()->startOfMonth()->toDateString();
        $to = $data['to'] ?? now()->toDateString();

        $enrolledStudents = Enrollment::with('student.user')
            ->where('class_section_id', $data['class_section_id'])
            ->where('status', 'active')
            ->get();

        $report = $enrolledStudents->map(function ($enrollment) use ($data, $from, $to) {
            $records = Attendance::where('student_id', $enrollment->student_id)
                ->where('class_section_id', $data['class_section_id'])
                ->whereBetween('date', [$from, $to])
                ->get();

            $total = $records->count();
            $present = $records->whereIn('status', ['present', 'late'])->count();
            $absent = $records->where('status', 'absent')->count();
            $late = $records->where('status', 'late')->count();

            return [
                'student' => $enrollment->student->load('user'),
                'total_days' => $total,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
            ];
        });

        return response()->json([
            'from' => $from,
            'to' => $to,
            'class_section_id' => $data['class_section_id'],
            'report' => $report,
        ]);
    }
}
