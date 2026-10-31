<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeePayment;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FeePaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FeePayment::with(['student.user', 'feeStructure', 'recordedBy']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->latest('payment_date')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'fee_structure_id' => ['required', 'exists:fee_structures,id'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,card,bank_transfer,online'],
            'status' => ['nullable', 'string', 'in:paid,partial,pending'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = FeePayment::create([
            ...$data,
            'status' => $data['status'] ?? 'paid',
            'receipt_number' => 'RCP-'.strtoupper(Str::random(8)),
            'recorded_by' => $request->user()->id,
        ]);

        AuditService::log('created', $payment, null, $payment->toArray());

        return response()->json($payment->load(['student.user', 'feeStructure']), 201);
    }

    public function show(FeePayment $feePayment): JsonResponse
    {
        return response()->json($feePayment->load(['student.user', 'feeStructure', 'recordedBy']));
    }

    public function summary(): JsonResponse
    {
        $totalCollected = FeePayment::where('status', 'paid')->sum('amount_paid');
        $thisMonth = FeePayment::where('status', 'paid')
            ->whereMonth('payment_date', now()->month)
            ->sum('amount_paid');
        $pendingCount = FeePayment::where('status', 'pending')->count();
        $totalPayments = FeePayment::count();

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
            'total_payments' => $totalPayments,
            'monthly_chart' => $monthly,
        ]);
    }
}
