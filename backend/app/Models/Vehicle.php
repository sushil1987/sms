<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'transport_route_id', 'vehicle_number', 'driver_name',
        'driver_phone', 'capacity', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class, 'transport_route_id');
    }

    public function studentTransports(): HasMany
    {
        return $this->hasMany(StudentTransport::class);
    }
}
