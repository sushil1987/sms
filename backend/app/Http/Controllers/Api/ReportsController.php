<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\FeePayment;
use App\Models\Hostel;
use App\Models\HostelAllocation;
use App\Models\HostelRoom;
use App\Models\School;
use App\Models\Student;
use App\Models\StudentTransport;
use App\Models\Teacher;
use App\Models\TransportRoute;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'schools' => School::count(),
            'students' => Student::where('status', 'active')->count(),
            'teachers' => Teacher::count(),
            'library' => [
                'total_books' => Book::sum('total_copies'),
                'available' => Book::sum('available_copies'),
                'issued' => BookIssue::where('status', 'issued')->count(),
                'overdue' => BookIssue::where('status', 'issued')->where('due_date', '<', now())->count(),
            ],
            'transport' => [
                'routes' => TransportRoute::where('is_active', true)->count(),
                'vehicles' => Vehicle::where('is_active', true)->count(),
                'students' => StudentTransport::where('status', 'active')->count(),
            ],
            'hostel' => [
                'hostels' => Hostel::where('is_active', true)->count(),
                'rooms' => HostelRoom::count(),
                'total_capacity' => HostelRoom::sum('capacity'),
                'occupied' => HostelRoom::sum('occupied'),
                'allocations' => HostelAllocation::where('status', 'active')->count(),
            ],
        ]);
    }

    public function library(): JsonResponse
    {
        return response()->json([
            'by_category' => Book::select('category', DB::raw('sum(total_copies) as total'))
                ->groupBy('category')->get(),
            'issue_trend' => BookIssue::select(DB::raw('date(issued_at) as date'), DB::raw('count(*) as count'))
                ->where('issued_at', '>=', now()->subDays(30))
                ->groupBy('date')->orderBy('date')->get(),
            'top_books' => BookIssue::select('book_id', DB::raw('count(*) as issues'))
                ->groupBy('book_id')->orderByDesc('issues')->limit(5)
                ->with('book:id,title')->get(),
        ]);
    }

    public function transport(): JsonResponse
    {
        return response()->json([
            'routes' => TransportRoute::withCount('studentTransports')
                ->with('vehicles')->get()
                ->map(fn ($r) => [
                    'name' => $r->name,
                    'students' => $r->student_transports_count,
                    'vehicles' => $r->vehicles->count(),
                    'fare' => $r->monthly_fare,
                ]),
            'revenue_potential' => StudentTransport::where('status', 'active')
                ->join('transport_routes', 'student_transports.transport_route_id', '=', 'transport_routes.id')
                ->sum('transport_routes.monthly_fare'),
        ]);
    }

    public function hostel(): JsonResponse
    {
        $rooms = HostelRoom::with('hostel')->get();

        return response()->json([
            'occupancy' => $rooms->map(fn ($r) => [
                'hostel' => $r->hostel->name,
                'room' => $r->room_number,
                'capacity' => $r->capacity,
                'occupied' => $r->occupied,
                'rate' => $r->capacity > 0 ? round(($r->occupied / $r->capacity) * 100, 1) : 0,
            ]),
            'by_hostel' => Hostel::with('rooms')->get()->map(fn ($h) => [
                'name' => $h->name,
                'type' => $h->type,
                'capacity' => $h->rooms->sum('capacity'),
                'occupied' => $h->rooms->sum('occupied'),
            ]),
        ]);
    }

    public function schools(): JsonResponse
    {
        return response()->json(
            School::withCount(['students', 'teachers'])
                ->with(['books', 'hostels', 'transportRoutes'])
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                    'city' => $s->city,
                    'students' => $s->students_count,
                    'teachers' => $s->teachers_count,
                    'books' => $s->books->sum('total_copies'),
                    'routes' => $s->transportRoutes->count(),
                    'hostels' => $s->hostels->count(),
                    'fees_collected' => FeePayment::whereHas('student', fn ($q) => $q->where('school_id', $s->id))
                        ->where('status', 'paid')->sum('amount_paid'),
                ])
        );
    }
}
