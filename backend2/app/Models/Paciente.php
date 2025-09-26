<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Paciente extends Model
{
    use HasFactory;

    protected $table = 'pacientes';
    protected $fillable = [
        'nombre',
        'email',
        'telefono',
        'eps_id',
        'user_id'
    ];

    public function citas()
    {
        return $this->hasMany(Cita::class, 'pacientes_id');
    }

    // Un paciente pertenece a una EPS
    public function eps()
    {
        return $this->belongsTo(EPS::class, 'eps_id');
    }

    // Un paciente pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}