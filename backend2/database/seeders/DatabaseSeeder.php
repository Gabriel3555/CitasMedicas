<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        \App\Models\EPS::factory(10)->create();
        \App\Models\Especialidad::factory(10)->create();
        \App\Models\Doctor::factory(5)->create();
        \App\Models\Paciente::factory(5)->create();
        \App\Models\Cita::factory(10)->create();
    }
}
