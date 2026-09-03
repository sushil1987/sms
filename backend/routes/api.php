<?php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClassSectionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\FeePaymentController;
use App\Http\Controllers\Api\FeeStructureController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentPortalController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TeacherPortalController;
use App\Http\Controllers\Api\TimetableController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics'])
        ->middleware('role:admin');

    // Shared read access
    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/subjects', [SubjectController::class, 'index']);
        Route::get('/academic-years', [AcademicYearController::class, 'index']);
    });

    Route::get('/announcements', [AnnouncementController::class, 'index'])
        ->middleware('role:admin,teacher,student,parent');

    Route::get('/timetables', [TimetableController::class, 'index'])
        ->middleware('role:admin,teacher,student');

    // Academic operations — admin & teacher
    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::get('/attendance/sheet', [AttendanceController::class, 'classSheet']);
        Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore']);
        Route::get('/attendance/report', [AttendanceController::class, 'report']);

        Route::get('/grades', [GradeController::class, 'index']);
        Route::post('/grades', [GradeController::class, 'store']);
        Route::put('/grades/{grade}', [GradeController::class, 'update']);
        Route::delete('/grades/{grade}', [GradeController::class, 'destroy']);
    });

    Route::get('/grades/report-card/{student}', [GradeController::class, 'reportCard'])
        ->middleware('role:admin,teacher,student');

    // Admin-only management
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('students', StudentController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('classes', ClassSectionController::class);
        Route::apiResource('subjects', SubjectController::class)->except(['index']);
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::apiResource('timetables', TimetableController::class)->except(['index']);
        Route::apiResource('academic-years', AcademicYearController::class)->except(['index']);
        Route::apiResource('fee-structures', FeeStructureController::class);
        Route::get('/fee-payments/summary', [FeePaymentController::class, 'summary']);
        Route::apiResource('fee-payments', FeePaymentController::class)->only(['index', 'store', 'show']);
        Route::apiResource('announcements', AnnouncementController::class)->except(['index']);
        Route::apiResource('documents', DocumentController::class)->except(['update']);
        Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });

    // Teacher portal
    Route::prefix('teacher')->middleware('role:teacher')->group(function () {
        Route::get('/dashboard', [TeacherPortalController::class, 'dashboard']);
        Route::get('/classes', [TeacherPortalController::class, 'classes']);
        Route::get('/classes/{classSection}/students', [TeacherPortalController::class, 'classStudents']);
        Route::get('/classes/{classSection}/timetable', [TeacherPortalController::class, 'classTimetable']);
    });

    // Student portal
    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/dashboard', [StudentPortalController::class, 'dashboard']);
        Route::get('/attendance', [StudentPortalController::class, 'attendance']);
        Route::get('/grades', [StudentPortalController::class, 'grades']);
        Route::get('/timetable', [StudentPortalController::class, 'timetable']);
    });
});
