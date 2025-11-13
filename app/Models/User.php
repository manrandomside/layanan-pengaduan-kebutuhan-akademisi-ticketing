<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'nama_lengkap',
        'nim_nip',
        'email',
        'no_telepon',
        'status',
        'password',
        'total_tickets',
        'daily_tickets',
        'last_ticket_reset',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'last_ticket_reset' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id', 'user_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'user_id', 'user_id');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'user_id', 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id', 'user_id');
    }

    public function emailVerifications()
    {
        return $this->hasMany(EmailVerification::class, 'user_id', 'user_id');
    }
}