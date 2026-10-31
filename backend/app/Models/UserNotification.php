<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotification extends Model
{
    protected $table = 'user_notifications';

    protected $fillable = [
        'user_id', 'type', 'title', 'message', 'data',
        'channel', 'is_read', 'read_at', 'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_read' => 'boolean',
            'read_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
