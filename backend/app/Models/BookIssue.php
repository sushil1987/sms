<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookIssue extends Model
{
    protected $fillable = [
        'book_id', 'student_id', 'issued_at', 'due_date',
        'returned_at', 'status', 'fine_amount', 'issued_by',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'due_date' => 'date',
            'returned_at' => 'date',
            'fine_amount' => 'decimal:2',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
