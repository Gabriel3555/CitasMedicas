<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {

        DB::statement("ALTER TABLE citas MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'completed', 'pendiente_por_aprobador', 'no_aprobado', 'completada') DEFAULT 'pendiente_por_aprobador'");

        DB::table('citas')->where('status', 'pending')->update(['status' => 'pendiente_por_aprobador']);

        DB::statement("ALTER TABLE citas MODIFY COLUMN status ENUM('pendiente_por_aprobador', 'no_aprobado', 'completada') DEFAULT 'pendiente_por_aprobador'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE citas MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'completed', 'pendiente_por_aprobador', 'no_aprobado', 'completada') DEFAULT 'pending'");

        DB::table('citas')->where('status', 'pendiente_por_aprobador')->update(['status' => 'pending']);

        DB::statement("ALTER TABLE citas MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending'");
    }
};
