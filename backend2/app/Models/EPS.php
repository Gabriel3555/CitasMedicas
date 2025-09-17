<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EPS extends Model
{
    protected $table = 'eps';

    protected $fillable = [
        'nombre'
    ];

    // Una EPS tiene muchos pacientes
    public function pacientes()
    {
        return $this->hasMany(Paciente::class, 'eps_id');
    }

    // Una EPS tiene muchos doctores
    public function doctores()
    {
        return $this->hasMany(Doctor::class, 'eps_id');
    }
}