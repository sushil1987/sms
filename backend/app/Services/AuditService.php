<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditService
{
    public static function log(
        string $action,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null,
    ): AuditLog {
        $request = $request ?? request();

        return AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'model_type' => $model ? $model::class : null,
            'model_id' => $model?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
