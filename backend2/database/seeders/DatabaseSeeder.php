<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        \App\Models\EPS::factory(10)->create();
        \App\Models\Especialidad::factory(10)->create();
        \App\Models\Doctor::factory(5)->create();
        \App\Models\Paciente::factory(5)->create();
        \App\Models\Cita::factory(10)->create();
    }
}
