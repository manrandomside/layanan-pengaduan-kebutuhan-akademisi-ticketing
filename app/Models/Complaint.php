<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $table = 'complaints';
    protected $primaryKey = 'complaint_id';

    protected $fillable = [
        'ticket_id',
        'user_id',
        'nama_lengkap',
        'nim_nip',
        'email',
        'no_telepon',
        'status_user',
        'kelas',
        'lab',
        'ruangan',
        'keluhan',
        'priority',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id', 'ticket_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(ComplaintStatusHistory::class, 'complaint_id', 'complaint_id');
    }

    public function feedback()
    {
        return $this->hasOne(Feedback::class, 'complaint_id', 'complaint_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'related_complaint_id', 'complaint_id');
    }
}