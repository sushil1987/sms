<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeePayment extends Model
{
    protected $fillable = [
        'student_id', 'fee_structure_id', 'amount_paid', 'payment_date',
        'payment_method', 'status', 'receipt_number', 'notes', 'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
