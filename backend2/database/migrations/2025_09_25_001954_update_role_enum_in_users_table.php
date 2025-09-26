<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update enum to include all three roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('paciente', 'doctor', 'admin') DEFAULT 'paciente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum back to only admin
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin') DEFAULT 'admin'");
    }
};
