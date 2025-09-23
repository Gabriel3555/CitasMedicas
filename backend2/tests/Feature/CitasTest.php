<?php

namespace Tests\Feature;

use App\Models\Cita;
use App\Models\Paciente;
use App\Models\Doctor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CitasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear EPS y Especialidad necesarias
        \App\Models\EPS::create(['nombre' => 'EPS Test']);
        \App\Models\Especialidad::create(['nombre' => 'Especialidad Test']);

        // Deshabilitar middleware JWT para tests
        $this->withoutMiddleware();
    }

    public function test_can_create_cita_when_doctor_available()
    {
        $paciente = Paciente::factory()->create();
        $doctor = Doctor::factory()->create();

        $data = [
            'pacientes_id' => $paciente->id,
            'doctor_id' => $doctor->id,
            'fecha' => '2025-09-25',
            'hora' => '10:00'
        ];

        $response = $this->postJson('/api/citas', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('citas', $data);
    }

    public function test_cannot_create_cita_when_doctor_not_available()
    {
        $paciente1 = Paciente::factory()->create();
        $paciente2 = Paciente::factory()->create();
        $doctor = Doctor::factory()->create();

        // Create first cita
        Cita::create([
            'pacientes_id' => $paciente1->id,
            'doctor_id' => $doctor->id,
            'fecha' => '2025-09-25',
            'hora' => '10:00'
        ]);

        // Try to create second cita at same time
        $data = [
            'pacientes_id' => $paciente2->id,
            'doctor_id' => $doctor->id,
            'fecha' => '2025-09-25',
            'hora' => '10:00'
        ];

        $response = $this->postJson('/api/citas', $data);

        $response->assertStatus(409)
                 ->assertJson(['message' => 'El doctor no está disponible en esa fecha y hora']);
    }

    public function test_can_list_citas()
    {
        Cita::factory()->count(3)->create();

        $response = $this->getJson('/api/citas');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }
}
