<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeedbackResponse extends Model
{
    use HasFactory;

    protected $table = 'feedback_responses';
    protected $primaryKey = 'response_id';
    public $timestamps = false;

    protected $fillable = [
        'feedback_id',
        'admin_id',
        'response_text',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function feedback()
    {
        return $this->belongsTo(Feedback::class, 'feedback_id', 'feedback_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id', 'admin_id');
    }
}