<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Doctor>
 */
class DoctorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'telefono' => $this->faker->phoneNumber,
            'especialidad_id' => $this->faker->numberBetween(1, 5), // Random especialidad
            'eps_id' => $this->faker->numberBetween(1, 10), // Random EPS
            'start_time' => $this->faker->time('H:i', '09:00'),
            'end_time' => $this->faker->time('H:i', '17:00'),
        ];
    }
}
