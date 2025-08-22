<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class doctores extends Model
{
    protected $fillable = [
      "nombre",
      "especialidad",
      "email",
        "telefono",
    ];

    public function citas(){
        return $this->hasMany(citas::class, "doctor_id");
    }
}
