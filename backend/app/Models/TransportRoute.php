<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportRoute extends Model
{
    protected $fillable = [
        'school_id', 'name', 'description', 'monthly_fare', 'stops', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'monthly_fare' => 'decimal:2',
            'stops' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function studentTransports(): HasMany
    {
        return $this->hasMany(StudentTransport::class);
    }
}
