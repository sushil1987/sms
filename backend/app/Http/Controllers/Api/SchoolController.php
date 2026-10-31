<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(School::withCount(['students', 'teachers'])->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:schools,code'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string'],
            'principal_name' => ['nullable', 'string'],
        ]);

        return response()->json(School::create($data), 201);
    }

    public function show(School $school): JsonResponse
    {
        return response()->json($school->loadCount(['students', 'teachers', 'books', 'hostels']));
    }

    public function update(Request $request, School $school): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string'],
            'principal_name' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $school->update($data);

        return response()->json($school);
    }

    public function destroy(School $school): JsonResponse
    {
        $school->delete();

        return response()->json(['message' => 'School deleted.']);
    }
}
