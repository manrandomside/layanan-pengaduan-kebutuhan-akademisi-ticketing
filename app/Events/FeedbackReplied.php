<?php

namespace App\Events;

use App\Models\FeedbackResponse;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackReplied implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $feedbackResponse;

    public function __construct(FeedbackResponse $feedbackResponse)
    {
        $this->feedbackResponse = $feedbackResponse->load('feedback.complaint', 'admin');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->feedbackResponse->feedback->complaint->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FeedbackReplied';
    }

    public function broadcastWith(): array
    {
        return [
            'response_id' => $this->feedbackResponse->response_id,
            'feedback_id' => $this->feedbackResponse->feedback_id,
            'complaint_id' => $this->feedbackResponse->feedback->complaint_id,
            'ticket_id' => $this->feedbackResponse->feedback->complaint->ticket_id,
            'response_text' => $this->feedbackResponse->response_text,
            'admin_name' => $this->feedbackResponse->admin->nama ?? 'Admin',
            'created_at' => $this->feedbackResponse->created_at->toISOString(),
        ];
    }
}