<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAssistanceRequest extends Model
{
    use HasFactory;

    protected $table = 'admin_assistance_requests';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'type',
        'email_registered',
        'nama_lengkap',
        'nim_nip',
        'new_value',
        'status',
        'processed_by_admin',
        'admin_notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship to User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Relationship to Admin who processed the request
     */
    public function processedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'processed_by_admin', 'admin_id');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for processing requests
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope for completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get type label in Indonesian
     */
    public function getTypeLabelAttribute()
    {
        $labels = [
            'password_reset' => 'Reset Password',
            'email_change' => 'Ganti Email',
            'phone_change' => 'Ganti No Telepon',
        ];

        return $labels[$this->type] ?? $this->type;
    }

    /**
     * Get status label in Indonesian
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'completed' => 'Selesai',
            'rejected' => 'Ditolak',
        ];

        return $labels[$this->status] ?? $this->status;
    }
}