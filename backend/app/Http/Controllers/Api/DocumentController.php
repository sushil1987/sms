<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Student;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['uploadedBy', 'documentable']);

        if ($request->filled('student_id')) {
            $query->where('documentable_type', Student::class)
                ->where('documentable_id', $request->integer('student_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:certificate,id_card,transcript,medical,other'],
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $student = Student::findOrFail($data['student_id']);
        $file = $request->file('file');
        $path = $file->store('documents/'.$student->id, 'public');

        $document = $student->documents()->create([
            'title' => $data['title'],
            'type' => $data['type'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
        ]);

        AuditService::log('uploaded', $document, null, ['title' => $document->title, 'type' => $document->type]);

        return response()->json($document->load('uploadedBy'), 201);
    }

    public function show(Document $document): JsonResponse
    {
        return response()->json($document->load(['uploadedBy', 'documentable']));
    }

    public function destroy(Document $document): JsonResponse
    {
        Storage::disk('public')->delete($document->file_path);
        AuditService::log('deleted', $document, $document->toArray());
        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    public function download(Document $document): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}
