<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function index(): JsonResponse
    {
        $teachers = Teacher::with('user.role')->latest()->paginate(15);

        return response()->json($teachers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'employee_id' => ['required', 'string', 'unique:teachers,employee_id'],
            'department' => ['nullable', 'string', 'max:255'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
        ]);

        $teacherRole = Role::where('slug', 'teacher')->firstOrFail();

        $teacher = DB::transaction(function () use ($data, $teacherRole) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'role_id' => $teacherRole->id,
            ]);

            return Teacher::create([
                'user_id' => $user->id,
                'employee_id' => $data['employee_id'],
                'department' => $data['department'] ?? null,
                'qualification' => $data['qualification'] ?? null,
                'hire_date' => $data['hire_date'] ?? now()->toDateString(),
                'phone' => $data['phone'] ?? null,
            ]);
        });

        return response()->json($teacher->load('user.role'), 201);
    }

    public function show(Teacher $teacher): JsonResponse
    {
        return response()->json($teacher->load('user.role'));
    }

    public function update(Request $request, Teacher $teacher): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$teacher->user_id],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
        ]);

        if (isset($data['name']) || isset($data['email']) || isset($data['phone'])) {
            $teacher->user->update(array_filter([
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ], fn ($v) => $v !== null));
        }

        $teacher->update(array_filter([
            'department' => $data['department'] ?? null,
            'qualification' => $data['qualification'] ?? null,
            'hire_date' => $data['hire_date'] ?? null,
            'phone' => $data['phone'] ?? null,
        ], fn ($v) => $v !== null));

        return response()->json($teacher->fresh()->load('user.role'));
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        $teacher->user->delete();

        return response()->json(['message' => 'Teacher deleted successfully.']);
    }
}
