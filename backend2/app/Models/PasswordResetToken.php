<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PasswordResetToken extends Model
{
    protected $primaryKey = 'email';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'email',
        'token',
        'created_at', // ← AGREGAR ESTO
    ];

    protected $casts = [
        'created_at' => 'datetime', // ← CAMBIAR DE $dates A $casts
    ];

    /**
      * Check if token is expired (tokens expire after 1 hour)
      */
    public function isExpired()
    {
        if (!$this->created_at) {
            return true;
        }
        return $this->created_at->addHour()->isPast();
    }

    /**
     * Delete expired tokens
     */
    public static function deleteExpired()
    {
        return static::where('created_at', '<', Carbon::now()->subHour())->delete();
    }
}