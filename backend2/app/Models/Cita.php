<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cita extends Model
{
    use HasFactory;

    protected $table = 'citas';
    protected $fillable = [
        "pacientes_id",
        "doctor_id",
        "fecha",
        "hora",
        "status",
    ];

    // Relación con el paciente
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, "pacientes_id");
    }

    // Relación con el doctor
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, "doctor_id");
    }
}