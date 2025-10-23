<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PasswordResetToken extends Model
{
    protected $primaryKey = 'email';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'email',
        'token',
    ];

    protected $dates = [
        'created_at',
    ];

    public $timestamps = false;

    /**
      * Check if token is expired (tokens expire after 1 hour)
      */
    public function isExpired()
    {
        if (!$this->created_at) {
            return true; // If created_at is null, consider expired
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
