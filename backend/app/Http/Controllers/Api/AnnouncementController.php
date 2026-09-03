<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with('publishedBy')->latest();

        if ($request->boolean('published_only')) {
            $query->where('is_published', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                });
        }

        if ($request->filled('audience')) {
            $audience = $request->string('audience');
            $query->where(fn ($q) => $q->where('target_audience', 'all')->orWhere('target_audience', $audience));
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'target_audience' => ['required', 'string', 'in:all,admin,teacher,student,parent'],
            'priority' => ['nullable', 'string', 'in:low,normal,high,urgent'],
            'is_published' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $announcement = Announcement::create([
            ...$data,
            'priority' => $data['priority'] ?? 'normal',
            'published_by' => $request->user()->id,
            'published_at' => ($data['is_published'] ?? false) ? now() : null,
        ]);

        AuditService::log('created', $announcement, null, $announcement->toArray());

        return response()->json($announcement->load('publishedBy'), 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json($announcement->load('publishedBy'));
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'target_audience' => ['sometimes', 'string'],
            'priority' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
        ]);

        if (isset($data['is_published']) && $data['is_published'] && ! $announcement->published_at) {
            $data['published_at'] = now();
        }

        $old = $announcement->toArray();
        $announcement->update($data);
        AuditService::log('updated', $announcement, $old, $announcement->fresh()->toArray());

        return response()->json($announcement->load('publishedBy'));
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        AuditService::log('deleted', $announcement, $announcement->toArray());
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
