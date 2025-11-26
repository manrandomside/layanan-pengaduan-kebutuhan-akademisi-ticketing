<?php

namespace App\Events;

use App\Models\FeedbackResponse;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackReplied implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $feedbackResponse;

    public function __construct(FeedbackResponse $feedbackResponse)
    {
        $this->feedbackResponse = $feedbackResponse->load('feedback.complaint');
    }

    // Broadcast to specific user private channel
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->feedbackResponse->feedback->complaint->user_id),
        ];
    }

    // Data to broadcast
    public function broadcastWith(): array
    {
        return [
            'response_id' => $this->feedbackResponse->response_id,
            'feedback_id' => $this->feedbackResponse->feedback_id,
            'response_text' => $this->feedbackResponse->response_text,
            'admin_name' => $this->feedbackResponse->admin->nama ?? 'Admin',
            'created_at' => $this->feedbackResponse->created_at->toISOString(),
        ];
    }
}