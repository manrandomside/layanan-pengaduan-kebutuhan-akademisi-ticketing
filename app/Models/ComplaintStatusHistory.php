<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'complaint_status_history';
    protected $primaryKey = 'history_id';
    public $timestamps = false;

    protected $fillable = [
        'complaint_id',
        'status_lama',
        'status_baru',
        'changed_by_admin',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id', 'complaint_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'changed_by_admin', 'admin_id');
    }
}