<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentTransport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentTransportController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            StudentTransport::with(['student.user', 'route', 'vehicle'])->paginate(20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'transport_route_id' => ['required', 'exists:transport_routes,id'],
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'pickup_point' => ['nullable', 'string'],
        ]);

        return response()->json(
            StudentTransport::create($data)->load(['student.user', 'route', 'vehicle']),
            201
        );
    }

    public function destroy(StudentTransport $studentTransport): JsonResponse
    {
        $studentTransport->delete();

        return response()->json(['message' => 'Transport assignment removed.']);
    }
}
