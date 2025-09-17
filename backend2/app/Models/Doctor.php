<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $table = 'doctores';
    protected $fillable = [
        'nombre',
        'telefono',
        'email',
        'especialidad_id',
        'eps_id'
    ];

    public function citas()
    {
        return $this->hasMany(Cita::class, 'doctor_id');
    }

    // Un doctor pertenece a una EPS
    public function eps()
    {
        return $this->belongsTo(EPS::class, 'eps_id');
    }

    // Un doctor pertenece a una especialidad
    public function especialidad()
    {
        return $this->belongsTo(Especialidad::class, 'especialidad_id');
    }
}