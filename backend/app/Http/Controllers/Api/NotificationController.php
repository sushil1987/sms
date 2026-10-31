<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = UserNotification::where('user_id', $request->user()->id)
            ->latest();

        if ($request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        return response()->json([
            'notifications' => $query->paginate(20),
            'unread_count' => UserNotification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count(),
        ]);
    }

    public function markRead(UserNotification $notification, Request $request): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        UserNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
