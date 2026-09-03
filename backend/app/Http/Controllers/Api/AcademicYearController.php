<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;

class AcademicYearController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AcademicYear::orderByDesc('start_date')->get());
    }
}
