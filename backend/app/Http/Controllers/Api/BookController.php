<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Book::with('school');

        if ($request->filled('school_id')) {
            $query->where('school_id', $request->integer('school_id'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        return response()->json($query->orderBy('title')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_id' => ['required', 'exists:schools,id'],
            'title' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string'],
            'isbn' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'total_copies' => ['required', 'integer', 'min:1'],
            'shelf_location' => ['nullable', 'string'],
        ]);

        $book = Book::create([
            ...$data,
            'available_copies' => $data['total_copies'],
        ]);

        return response()->json($book->load('school'), 201);
    }

    public function show(Book $book): JsonResponse
    {
        return response()->json($book->load(['school', 'issues.student.user']));
    }

    public function update(Request $request, Book $book): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'author' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'total_copies' => ['sometimes', 'integer', 'min:1'],
            'shelf_location' => ['nullable', 'string'],
        ]);

        if (isset($data['total_copies'])) {
            $issued = $book->total_copies - $book->available_copies;
            $data['available_copies'] = max(0, $data['total_copies'] - $issued);
        }

        $book->update($data);

        return response()->json($book);
    }

    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        return response()->json(['message' => 'Book deleted.']);
    }
}
