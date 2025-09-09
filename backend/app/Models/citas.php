<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class citas extends Model
{
    protected $fillable = [
        "pacientes_id",
        "doctor_id",
        "fecha",
        "hora",
    ];

    public function paciente()
    {
        return $this->belongsTo(pacientes::class, "pacientes_id");
    }

    public function doctor()
    {
        return $this->belongsTo(doctores::class, "doctor_id");
    }
}
