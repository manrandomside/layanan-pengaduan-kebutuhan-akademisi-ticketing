<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailVerification extends Model
{
    use HasFactory;

    protected $table = 'email_verifications';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'email',
        'no_telepon',
        'token',
        'type',
        'is_verified',
        'expires_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Scope for pending verifications
    public function scopePending($query)
    {
        return $query->where('is_verified', 'pending');
    }

    // Scope for valid (not expired) tokens
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now());
    }

    // Scope for password reset type
    public function scopePasswordReset($query)
    {
        return $query->where('type', 'password_reset');
    }

    // Check if token is expired
    public function isExpired()
    {
        return $this->expires_at < now();
    }
}