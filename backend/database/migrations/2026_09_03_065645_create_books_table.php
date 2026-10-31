<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('author')->nullable();
            $table->string('isbn')->nullable();
            $table->string('category')->nullable();
            $table->unsignedInteger('total_copies')->default(1);
            $table->unsignedInteger('available_copies')->default(1);
            $table->string('shelf_location')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
