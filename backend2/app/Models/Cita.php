<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cita extends Model
{
    protected $table = 'citas';
    protected $fillable = [
        "pacientes_id",
        "doctor_id",
        "fecha",
        "hora",
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, "pacientes_id");
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, "doctor_id");
    }
}