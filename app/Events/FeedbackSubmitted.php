<?php

namespace App\Events;

use App\Models\Feedback;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $feedback;

    public function __construct(Feedback $feedback)
    {
        $this->feedback = $feedback->load('user', 'complaint');
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
            'feedback_id' => $this->feedback->feedback_id,
            'complaint_id' => $this->feedback->complaint_id,
            'user_id' => $this->feedback->user_id,
            'user_name' => $this->feedback->user->nama_lengkap ?? 'User',
            'rating' => $this->feedback->rating,
            'feedback_text' => $this->feedback->feedback_text,
            'ticket_id' => $this->feedback->complaint->ticket_id ?? null,
            'user' => [
                'nama_lengkap' => $this->feedback->user->nama_lengkap ?? 'User',
                'nim_nip' => $this->feedback->user->nim_nip ?? '-',
                'status' => $this->feedback->user->status ?? '-',
            ],
            'complaint' => [
                'ticket_id' => $this->feedback->complaint->ticket_id ?? '-',
                'keluhan' => $this->feedback->complaint->keluhan ?? '-',
                'kelas' => $this->feedback->complaint->kelas ?? null,
                'lab' => $this->feedback->complaint->lab ?? null,
                'ruangan' => $this->feedback->complaint->ruangan ?? null,
            ],
            'created_at' => $this->feedback->created_at->toISOString(),
        ];
    }
}