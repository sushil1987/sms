<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_route_id')->constrained()->cascadeOnDelete();
            $table->string('vehicle_number');
            $table->string('driver_name');
            $table->string('driver_phone')->nullable();
            $table->unsignedInteger('capacity')->default(40);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
