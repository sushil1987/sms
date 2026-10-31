<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hostel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HostelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Hostel::with('school')->withCount('rooms');

        if ($request->filled('school_id')) {
            $query->where('school_id', $request->integer('school_id'));
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_id' => ['required', 'exists:schools,id'],
            'name' => ['required', 'string'],
            'type' => ['required', 'string', 'in:boys,girls,mixed'],
            'address' => ['nullable', 'string'],
            'warden_name' => ['nullable', 'string'],
            'warden_phone' => ['nullable', 'string'],
        ]);

        return response()->json(Hostel::create($data)->load('school'), 201);
    }

    public function show(Hostel $hostel): JsonResponse
    {
        return response()->json($hostel->load(['school', 'rooms']));
    }

    public function update(Request $request, Hostel $hostel): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'type' => ['sometimes', 'string'],
            'warden_name' => ['nullable', 'string'],
            'warden_phone' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $hostel->update($data);

        return response()->json($hostel);
    }

    public function destroy(Hostel $hostel): JsonResponse
    {
        $hostel->delete();

        return response()->json(['message' => 'Hostel deleted.']);
    }
}
