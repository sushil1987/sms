<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HostelRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HostelRoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HostelRoom::with('hostel');

        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->integer('hostel_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'hostel_id' => ['required', 'exists:hostels,id'],
            'room_number' => ['required', 'string'],
            'floor' => ['nullable', 'integer'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        return response()->json(HostelRoom::create($data)->load('hostel'), 201);
    }

    public function update(Request $request, HostelRoom $hostelRoom): JsonResponse
    {
        $data = $request->validate([
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'floor' => ['nullable', 'integer'],
        ]);

        $hostelRoom->update($data);

        return response()->json($hostelRoom);
    }

    public function destroy(HostelRoom $hostelRoom): JsonResponse
    {
        $hostelRoom->delete();

        return response()->json(['message' => 'Room deleted.']);
    }
}
