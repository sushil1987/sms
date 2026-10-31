<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Subject::orderBy('name')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code'],
            'description' => ['nullable', 'string'],
        ]);

        $subject = Subject::create($data);

        return response()->json($subject, 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        return response()->json($subject);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:20', 'unique:subjects,code,'.$subject->id],
            'description' => ['nullable', 'string'],
        ]);

        $subject->update($data);

        return response()->json($subject);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $subject->delete();

        return response()->json(['message' => 'Subject deleted successfully.']);
    }
}
