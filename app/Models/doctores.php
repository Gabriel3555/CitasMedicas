<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class doctores extends Model
{
    protected $fillable = [
        'nombre',
        'especialidad',
        'email',
        'telefono',
        'eps_id'
    ];

    public function citas()
    {
        return $this->hasMany(Citas::class, 'doctor_id');
    }

    // Un doctor pertenece a una EPS
    public function eps()
    {
        return $this->belongsTo(EPS::class, 'eps_id');
    }
}
