<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintHidden implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaint_id;
    public $ticket_id;
    public $user_id;
    public $is_hidden;

    /**
     * Create a new event instance.
     */
    public function __construct($complaint_id, $ticket_id, $user_id, $is_hidden)
    {
        $this->complaint_id = $complaint_id;
        $this->ticket_id = $ticket_id;
        $this->user_id = $user_id;
        $this->is_hidden = $is_hidden;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-channel'),
            new PrivateChannel('user.' . $this->user_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ComplaintHidden';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'complaint_id' => $this->complaint_id,
            'ticket_id' => $this->ticket_id,
            'user_id' => $this->user_id,
            'is_hidden' => $this->is_hidden,
            'timestamp' => now()->toISOString(),
        ];
    }
}