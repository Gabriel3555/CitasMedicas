<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Paciente;
use App\Models\Doctor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear EPS y Especialidad necesarias
        \App\Models\EPS::create(['nombre' => 'EPS Test']);
        \App\Models\Especialidad::create(['nombre' => 'Especialidad Test']);
    }

    public function test_user_can_register_as_paciente()
    {
        $data = [
            'name' => 'Test Paciente',
            'email' => 'paciente@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'paciente'
        ];

        $response = $this->postJson('/api/register', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'paciente@test.com', 'role' => 'paciente']);
        $this->assertDatabaseHas('pacientes', ['email' => 'paciente@test.com']);
    }

    public function test_user_can_register_as_doctor()
    {
        $data = [
            'name' => 'Test Doctor',
            'email' => 'doctor@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'doctor'
        ];

        $response = $this->postJson('/api/register', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'doctor@test.com', 'role' => 'doctor']);
        $this->assertDatabaseHas('doctores', ['email' => 'doctor@test.com']);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'login@test.com',
            'password' => bcrypt('password'),
            'role' => 'paciente'
        ]);

        Paciente::create([
            'nombre' => $user->name,
            'email' => $user->email,
            'telefono' => '1234567890',
            'eps_id' => 1
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@test.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['user', 'token']);
    }
}
