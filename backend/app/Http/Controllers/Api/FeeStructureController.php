<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeeStructureController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            FeeStructure::with('academicYear')->latest()->paginate(15)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'grade_level' => ['nullable', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $fee = FeeStructure::create($data);
        AuditService::log('created', $fee, null, $fee->toArray());

        return response()->json($fee->load('academicYear'), 201);
    }

    public function show(FeeStructure $feeStructure): JsonResponse
    {
        return response()->json($feeStructure->load(['academicYear', 'payments.student.user']));
    }

    public function update(Request $request, FeeStructure $feeStructure): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'grade_level' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $old = $feeStructure->toArray();
        $feeStructure->update($data);
        AuditService::log('updated', $feeStructure, $old, $feeStructure->fresh()->toArray());

        return response()->json($feeStructure->load('academicYear'));
    }

    public function destroy(FeeStructure $feeStructure): JsonResponse
    {
        AuditService::log('deleted', $feeStructure, $feeStructure->toArray());
        $feeStructure->delete();

        return response()->json(['message' => 'Fee structure deleted.']);
    }
}
