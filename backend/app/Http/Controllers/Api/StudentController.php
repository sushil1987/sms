<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(): JsonResponse
    {
        $students = Student::with(['user.role', 'enrollments.classSection'])
            ->latest()
            ->paginate(15);

        return response()->json($students);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'admission_number' => ['required', 'string', 'unique:students,admission_number'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'admission_date' => ['nullable', 'date'],
        ]);

        $studentRole = Role::where('slug', 'student')->firstOrFail();

        $student = DB::transaction(function () use ($data, $studentRole) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'role_id' => $studentRole->id,
            ]);

            return Student::create([
                'user_id' => $user->id,
                'admission_number' => $data['admission_number'],
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'guardian_name' => $data['guardian_name'] ?? null,
                'guardian_phone' => $data['guardian_phone'] ?? null,
                'address' => $data['address'] ?? null,
                'admission_date' => $data['admission_date'] ?? now()->toDateString(),
                'status' => 'active',
            ]);
        });

        return response()->json($student->load('user.role'), 201);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json($student->load(['user.role', 'enrollments.classSection', 'grades.subject']));
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$student->user_id],
            'phone' => ['nullable', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:active,inactive,graduated,transferred'],
        ]);

        if (isset($data['name']) || isset($data['email']) || isset($data['phone'])) {
            $student->user->update(array_filter([
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ], fn ($v) => $v !== null));
        }

        $student->update(array_filter([
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'guardian_name' => $data['guardian_name'] ?? null,
            'guardian_phone' => $data['guardian_phone'] ?? null,
            'address' => $data['address'] ?? null,
            'status' => $data['status'] ?? null,
        ], fn ($v) => $v !== null));

        return response()->json($student->fresh()->load('user.role'));
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->user->delete();

        return response()->json(['message' => 'Student deleted successfully.']);
    }
}
