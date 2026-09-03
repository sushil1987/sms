<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}
