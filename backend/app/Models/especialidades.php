<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class especialidades extends Model
{
    protected $table = 'especialidades';
    protected $fillable = ['nombre'];
    public $timestamps = false;
}
