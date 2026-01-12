<?php

namespace App\Events;

use App\Models\AdminAssistanceRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AssistanceRequestSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $assistanceRequest;

    /**
     * Create a new event instance
     */
    public function __construct(AdminAssistanceRequest $assistanceRequest)
    {
        $this->assistanceRequest = $assistanceRequest;
    }

    /**
     * Get the channels the event should broadcast on (admin-channel)
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-channel'),
        ];
    }

    /**
     * The event's broadcast name
     */
    public function broadcastAs(): string
    {
        return 'AssistanceRequestSubmitted';
    }

    /**
     * Get the data to broadcast
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->assistanceRequest->id,
            'user_id' => $this->assistanceRequest->user_id,
            'type' => $this->assistanceRequest->type,
            'type_label' => $this->assistanceRequest->type_label,
            'email_registered' => $this->assistanceRequest->email_registered,
            'nama_lengkap' => $this->assistanceRequest->nama_lengkap,
            'nim_nip' => $this->assistanceRequest->nim_nip,
            'new_value' => $this->assistanceRequest->new_value,
            'status' => $this->assistanceRequest->status,
            'status_label' => $this->assistanceRequest->status_label,
            'created_at' => $this->assistanceRequest->created_at->toISOString(),
        ];
    }
}