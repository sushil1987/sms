<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelAllocation extends Model
{
    protected $fillable = [
        'student_id', 'hostel_room_id', 'allocated_at', 'vacated_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'allocated_at' => 'date',
            'vacated_at' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class, 'hostel_room_id');
    }
}
