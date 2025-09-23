<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cita>
 */
class CitaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pacientes_id' => \App\Models\Paciente::factory(),
            'doctor_id' => \App\Models\Doctor::factory(),
            'fecha' => $this->faker->date(),
            'hora' => $this->faker->time('H:i'),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected', 'completed']),
        ];
    }
}
