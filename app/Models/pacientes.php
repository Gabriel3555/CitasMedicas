<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class pacientes extends Model
{
    protected $fillable = [
        'nombre',
        'email',
        'telefono',
        'documento',
        'eps_id'
    ];

    public function citas()
    {
        return $this->hasMany(Citas::class, 'pacientes_id');
    }

    // Un paciente pertenece a una EPS
    public function eps()
    {
        return $this->belongsTo(EPS::class, 'eps_id');
    }
}
