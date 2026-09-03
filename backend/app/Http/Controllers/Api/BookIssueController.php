<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookIssue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookIssueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BookIssue::with(['book', 'student.user', 'issuedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function issue(Request $request): JsonResponse
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'student_id' => ['required', 'exists:students,id'],
            'due_date' => ['required', 'date', 'after:today'],
        ]);

        $book = Book::findOrFail($data['book_id']);

        if ($book->available_copies < 1) {
            return response()->json(['message' => 'No copies available.'], 422);
        }

        $issue = BookIssue::create([
            ...$data,
            'issued_at' => now()->toDateString(),
            'status' => 'issued',
            'issued_by' => $request->user()->id,
        ]);

        $book->decrement('available_copies');

        return response()->json($issue->load(['book', 'student.user']), 201);
    }

    public function returnBook(BookIssue $bookIssue): JsonResponse
    {
        if ($bookIssue->status === 'returned') {
            return response()->json(['message' => 'Already returned.'], 422);
        }

        $fine = 0;
        if ($bookIssue->due_date->isPast()) {
            $fine = $bookIssue->due_date->diffInDays(now()) * 1.0;
        }

        $bookIssue->update([
            'status' => 'returned',
            'returned_at' => now()->toDateString(),
            'fine_amount' => $fine,
        ]);

        $bookIssue->book->increment('available_copies');

        return response()->json($bookIssue->load(['book', 'student.user']));
    }
}
