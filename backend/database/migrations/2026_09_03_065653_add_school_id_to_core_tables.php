<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('class_sections', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', fn (Blueprint $t) => $t->dropConstrainedForeignId('school_id'));
        Schema::table('teachers', fn (Blueprint $t) => $t->dropConstrainedForeignId('school_id'));
        Schema::table('class_sections', fn (Blueprint $t) => $t->dropConstrainedForeignId('school_id'));
    }
};
