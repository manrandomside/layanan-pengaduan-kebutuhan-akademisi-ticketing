<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'admins';
    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'nama',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function complaintStatusHistories()
    {
        return $this->hasMany(ComplaintStatusHistory::class, 'changed_by_admin', 'admin_id');
    }

    public function feedbackResponses()
    {
        return $this->hasMany(FeedbackResponse::class, 'admin_id', 'admin_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'admin_id', 'admin_id');
    }
}