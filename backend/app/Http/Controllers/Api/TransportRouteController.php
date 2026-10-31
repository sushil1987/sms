<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportRoute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransportRouteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TransportRoute::with(['school', 'vehicles'])->withCount('studentTransports');

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
            'description' => ['nullable', 'string'],
            'monthly_fare' => ['required', 'numeric', 'min:0'],
            'stops' => ['nullable', 'array'],
        ]);

        return response()->json(TransportRoute::create($data)->load('school'), 201);
    }

    public function show(TransportRoute $transportRoute): JsonResponse
    {
        return response()->json($transportRoute->load(['school', 'vehicles', 'studentTransports.student.user']));
    }

    public function update(Request $request, TransportRoute $transportRoute): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'description' => ['nullable', 'string'],
            'monthly_fare' => ['sometimes', 'numeric'],
            'stops' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        $transportRoute->update($data);

        return response()->json($transportRoute);
    }

    public function destroy(TransportRoute $transportRoute): JsonResponse
    {
        $transportRoute->delete();

        return response()->json(['message' => 'Route deleted.']);
    }
}
