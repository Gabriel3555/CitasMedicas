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
        // Add 'aprobada' to the enum values
        DB::statement("ALTER TABLE citas MODIFY COLUMN status ENUM('pendiente_por_aprobador', 'aprobada', 'no_aprobado', 'completada') DEFAULT 'pendiente_por_aprobador'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'aprobada' from the enum values
        DB::statement("ALTER TABLE citas MODIFY COLUMN status ENUM('pendiente_por_aprobador', 'no_aprobado', 'completada') DEFAULT 'pendiente_por_aprobador'");
    }
};
