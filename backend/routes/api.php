<?php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookIssueController;
use App\Http\Controllers\Api\ClassSectionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\FeePaymentController;
use App\Http\Controllers\Api\FeeStructureController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\HostelAllocationController;
use App\Http\Controllers\Api\HostelController;
use App\Http\Controllers\Api\HostelRoomController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ParentPortalController;
use App\Http\Controllers\Api\PrincipalPortalController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentPortalController;
use App\Http\Controllers\Api\StudentTransportController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TeacherPortalController;
use App\Http\Controllers\Api\TimetableController;
use App\Http\Controllers\Api\TransportRouteController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics'])
        ->middleware('role:admin');

    Route::middleware('role:admin,principal,teacher')->group(function () {
        Route::get('/subjects', [SubjectController::class, 'index']);
        Route::get('/academic-years', [AcademicYearController::class, 'index']);
    });

    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/schools', [SchoolController::class, 'index']);
    });

    Route::middleware('role:admin,principal')->group(function () {
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('classes', ClassSectionController::class);
        Route::apiResource('timetables', TimetableController::class)->except(['index']);
    });

    Route::get('/announcements', [AnnouncementController::class, 'index'])
        ->middleware('role:admin,teacher,student,parent');

    Route::get('/timetables', [TimetableController::class, 'index'])
        ->middleware('role:admin,principal,teacher,student,parent');

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

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('students', StudentController::class);
        Route::apiResource('subjects', SubjectController::class)->except(['index']);
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::apiResource('academic-years', AcademicYearController::class)->except(['index']);
        Route::apiResource('fee-structures', FeeStructureController::class);
        Route::get('/fee-payments/summary', [FeePaymentController::class, 'summary']);
        Route::apiResource('fee-payments', FeePaymentController::class)->only(['index', 'store', 'show']);
        Route::apiResource('announcements', AnnouncementController::class)->except(['index']);
        Route::apiResource('documents', DocumentController::class)->except(['update']);
        Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        // Phase 5 — Advanced
        Route::apiResource('schools', SchoolController::class)->except(['index']);
        Route::apiResource('books', BookController::class);
        Route::get('/book-issues', [BookIssueController::class, 'index']);
        Route::post('/book-issues/issue', [BookIssueController::class, 'issue']);
        Route::post('/book-issues/{bookIssue}/return', [BookIssueController::class, 'returnBook']);
        Route::apiResource('transport-routes', TransportRouteController::class);
        Route::apiResource('vehicles', VehicleController::class);
        Route::apiResource('student-transports', StudentTransportController::class)->only(['index', 'store', 'destroy']);
        Route::apiResource('hostels', HostelController::class);
        Route::apiResource('hostel-rooms', HostelRoomController::class)->except(['show']);
        Route::get('/hostel-allocations', [HostelAllocationController::class, 'index']);
        Route::post('/hostel-allocations', [HostelAllocationController::class, 'store']);
        Route::post('/hostel-allocations/{hostelAllocation}/vacate', [HostelAllocationController::class, 'vacate']);

        Route::prefix('reports')->group(function () {
            Route::get('/overview', [ReportsController::class, 'overview']);
            Route::get('/library', [ReportsController::class, 'library']);
            Route::get('/transport', [ReportsController::class, 'transport']);
            Route::get('/hostel', [ReportsController::class, 'hostel']);
            Route::get('/schools', [ReportsController::class, 'schools']);
        });
    });

    Route::prefix('principal')->middleware('role:principal')->group(function () {
        Route::get('/dashboard', [PrincipalPortalController::class, 'dashboard']);
    });

    Route::prefix('teacher')->middleware('role:teacher')->group(function () {
        Route::get('/dashboard', [TeacherPortalController::class, 'dashboard']);
        Route::get('/classes', [TeacherPortalController::class, 'classes']);
        Route::get('/classes/{classSection}/students', [TeacherPortalController::class, 'classStudents']);
        Route::get('/classes/{classSection}/timetable', [TeacherPortalController::class, 'classTimetable']);
    });

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::prefix('parent')->middleware('role:parent')->group(function () {
        Route::get('/dashboard', [ParentPortalController::class, 'dashboard']);
        Route::get('/children', [ParentPortalController::class, 'children']);
        Route::get('/children/{student}/attendance', [ParentPortalController::class, 'childAttendance']);
        Route::get('/children/{student}/grades', [ParentPortalController::class, 'childGrades']);
        Route::get('/children/{student}/fees', [ParentPortalController::class, 'childFees']);
        Route::get('/children/{student}/timetable', [ParentPortalController::class, 'childTimetable']);
    });

    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/dashboard', [StudentPortalController::class, 'dashboard']);
        Route::get('/attendance', [StudentPortalController::class, 'attendance']);
        Route::get('/grades', [StudentPortalController::class, 'grades']);
        Route::get('/timetable', [StudentPortalController::class, 'timetable']);
    });
});
