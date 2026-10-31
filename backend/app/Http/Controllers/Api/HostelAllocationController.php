<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HostelAllocation;
use App\Models\HostelRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HostelAllocationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            HostelAllocation::with(['student.user', 'room.hostel'])
                ->where('status', 'active')
                ->paginate(20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'hostel_room_id' => ['required', 'exists:hostel_rooms,id'],
            'allocated_at' => ['nullable', 'date'],
        ]);

        $room = HostelRoom::findOrFail($data['hostel_room_id']);

        if ($room->occupied >= $room->capacity) {
            return response()->json(['message' => 'Room is full.'], 422);
        }

        $allocation = HostelAllocation::create([
            ...$data,
            'allocated_at' => $data['allocated_at'] ?? now()->toDateString(),
            'status' => 'active',
        ]);

        $room->increment('occupied');

        return response()->json($allocation->load(['student.user', 'room.hostel']), 201);
    }

    public function vacate(HostelAllocation $hostelAllocation): JsonResponse
    {
        if ($hostelAllocation->status === 'vacated') {
            return response()->json(['message' => 'Already vacated.'], 422);
        }

        $hostelAllocation->update([
            'status' => 'vacated',
            'vacated_at' => now()->toDateString(),
        ]);

        $hostelAllocation->room->decrement('occupied');

        return response()->json($hostelAllocation);
    }
}
