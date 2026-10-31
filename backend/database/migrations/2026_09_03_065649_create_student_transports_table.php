<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_transports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transport_route_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('pickup_point')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_transports');
    }
};
