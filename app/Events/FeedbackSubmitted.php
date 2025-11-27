<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $feedbackId;
    public $complaintId;
    public $userId;
    public $rating;
    public $feedbackText;
    public $userData;
    public $complaintData;
    public $createdAt;

    public function __construct($feedbackId, $complaintId, $userId, $rating, $feedbackText, $userData, $complaintData, $createdAt)
    {
        $this->feedbackId = $feedbackId;
        $this->complaintId = $complaintId;
        $this->userId = $userId;
        $this->rating = $rating;
        $this->feedbackText = $feedbackText;
        $this->userData = $userData;
        $this->complaintData = $complaintData;
        $this->createdAt = $createdAt;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin-channel'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FeedbackSubmitted';
    }

    public function broadcastWith(): array
    {
        return [
            'feedback_id' => $this->feedbackId,
            'complaint_id' => $this->complaintId,
            'user_id' => $this->userId,
            'rating' => $this->rating,
            'feedback_text' => $this->feedbackText,
            'user' => $this->userData,
            'complaint' => $this->complaintData,
            'created_at' => $this->createdAt,
        ];
    }
}