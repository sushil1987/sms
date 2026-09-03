<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AcademicYear::orderByDesc('start_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_current' => ['boolean'],
        ]);

        if ($data['is_current'] ?? false) {
            AcademicYear::query()->update(['is_current' => false]);
        }

        $year = AcademicYear::create($data);
        AuditService::log('created', $year, null, $year->toArray());

        return response()->json($year, 201);
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        return response()->json($academicYear);
    }

    public function update(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
            'is_current' => ['boolean'],
        ]);

        if ($data['is_current'] ?? false) {
            AcademicYear::where('id', '!=', $academicYear->id)->update(['is_current' => false]);
        }

        $old = $academicYear->toArray();
        $academicYear->update($data);
        AuditService::log('updated', $academicYear, $old, $academicYear->fresh()->toArray());

        return response()->json($academicYear);
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        AuditService::log('deleted', $academicYear, $academicYear->toArray());
        $academicYear->delete();

        return response()->json(['message' => 'Academic year deleted.']);
    }
}
