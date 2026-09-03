<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AccountantPortalController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalCollected = FeePayment::where('status', 'paid')->sum('amount_paid');
        $thisMonth = FeePayment::where('status', 'paid')
            ->whereMonth('payment_date', now()->month)
            ->sum('amount_paid');
        $pendingCount = FeePayment::where('status', 'pending')->count();

        $monthly = FeePayment::where('status', 'paid')
            ->where('payment_date', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn ($p) => $p->payment_date->format('M Y'))
            ->map(fn ($group, $month) => ['month' => $month, 'total' => $group->sum('amount_paid')])
            ->values();

        return response()->json([
            'total_collected' => $totalCollected,
            'this_month' => $thisMonth,
            'pending_count' => $pendingCount,
            'active_students' => Student::where('status', 'active')->count(),
            'fee_structures' => FeeStructure::where('is_active', true)->count(),
            'monthly_chart' => $monthly,
            'recent_payments' => FeePayment::with(['student.user', 'feeStructure'])
                ->latest('payment_date')
                ->limit(10)
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'student' => $p->student->user->name,
                    'fee' => $p->feeStructure->name,
                    'amount_paid' => $p->amount_paid,
                    'payment_date' => $p->payment_date,
                    'receipt_number' => $p->receipt_number,
                    'payment_method' => $p->payment_method,
                ]),
            'by_method' => FeePayment::where('status', 'paid')
                ->select('payment_method', DB::raw('sum(amount_paid) as total'), DB::raw('count(*) as count'))
                ->groupBy('payment_method')
                ->get(),
        ]);
    }
}
