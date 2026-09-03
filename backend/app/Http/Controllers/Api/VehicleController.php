<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with('route');

        if ($request->filled('transport_route_id')) {
            $query->where('transport_route_id', $request->integer('transport_route_id'));
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'transport_route_id' => ['required', 'exists:transport_routes,id'],
            'vehicle_number' => ['required', 'string'],
            'driver_name' => ['required', 'string'],
            'driver_phone' => ['nullable', 'string'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        return response()->json(Vehicle::create($data)->load('route'), 201);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        return response()->json($vehicle->load(['route', 'studentTransports.student.user']));
    }

    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'vehicle_number' => ['sometimes', 'string'],
            'driver_name' => ['sometimes', 'string'],
            'driver_phone' => ['nullable', 'string'],
            'capacity' => ['sometimes', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $vehicle->update($data);

        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted.']);
    }
}
