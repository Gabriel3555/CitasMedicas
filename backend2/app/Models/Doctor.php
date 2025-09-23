<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Doctor extends Model
{
    use HasFactory;

    protected $table = 'doctores';
    protected $fillable = [
        'nombre',
        'telefono',
        'email',
        'especialidad_id',
        'eps_id',
        'user_id',
        'start_time',
        'end_time'
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

    // Un doctor pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}