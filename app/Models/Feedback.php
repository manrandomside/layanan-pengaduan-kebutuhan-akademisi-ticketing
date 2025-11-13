<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';
    protected $primaryKey = 'feedback_id';
    public $timestamps = false;

    protected $fillable = [
        'complaint_id',
        'user_id',
        'rating',
        'feedback_text',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id', 'complaint_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function responses()
    {
        return $this->hasMany(FeedbackResponse::class, 'feedback_id', 'feedback_id');
    }
}