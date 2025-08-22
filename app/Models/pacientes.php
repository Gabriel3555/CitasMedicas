<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class pacientes extends Model
{
    protected $fillable = [
        "nombre",
        "email",
        "telefono",
        "documento",
    ];

    public function citas(){
        return $this->hasMany(citas::class, "pacientes_id");
    }
}
