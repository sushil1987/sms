<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hostel extends Model
{
    protected $fillable = [
        'school_id', 'name', 'type', 'address',
        'warden_name', 'warden_phone', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(HostelRoom::class);
    }
}
