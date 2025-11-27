<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackReplied implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $responseId;
    public $feedbackId;
    public $complaintId;
    public $ticketId;
    public $userId;
    public $responseText;
    public $adminName;
    public $createdAt;

    public function __construct($responseId, $feedbackId, $complaintId, $ticketId, $userId, $responseText, $adminName, $createdAt)
    {
        $this->responseId = $responseId;
        $this->feedbackId = $feedbackId;
        $this->complaintId = $complaintId;
        $this->ticketId = $ticketId;
        $this->userId = $userId;
        $this->responseText = $responseText;
        $this->adminName = $adminName;
        $this->createdAt = $createdAt;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FeedbackReplied';
    }

    public function broadcastWith(): array
    {
        return [
            'response_id' => $this->responseId,
            'feedback_id' => $this->feedbackId,
            'complaint_id' => $this->complaintId,
            'ticket_id' => $this->ticketId,
            'response_text' => $this->responseText,
            'admin_name' => $this->adminName,
            'created_at' => $this->createdAt,
        ];
    }
}