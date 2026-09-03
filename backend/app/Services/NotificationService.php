<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public static function send(
        User $user,
        string $type,
        string $title,
        string $message,
        array $data = [],
        array $channels = ['in_app', 'email'],
    ): UserNotification {
        $notification = UserNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'channel' => implode(',', $channels),
            'sent_at' => now(),
        ]);

        if (in_array('email', $channels) && $user->email) {
            self::sendEmail($user, $title, $message);
        }

        if (in_array('sms', $channels) && $user->phone) {
            self::sendSms($user->phone, $message);
        }

        return $notification;
    }

    public static function sendToRole(string $roleSlug, string $type, string $title, string $message, array $data = []): void
    {
        User::whereHas('role', fn ($q) => $q->where('slug', $roleSlug))
            ->each(fn (User $user) => self::send($user, $type, $title, $message, $data));
    }

    public static function sendToAll(string $type, string $title, string $message, array $data = []): void
    {
        User::each(fn (User $user) => self::send($user, $type, $title, $message, $data));
    }

    private static function sendEmail(User $user, string $title, string $message): void
    {
        try {
            Mail::raw($message, function ($mail) use ($user, $title) {
                $mail->to($user->email)->subject("[EduSphere] {$title}");
            });
        } catch (\Throwable $e) {
            Log::info("Email notification to {$user->email}: {$title} — {$message}");
        }
    }

    private static function sendSms(string $phone, string $message): void
    {
        Log::info("SMS to {$phone}: {$message}");
    }
}
