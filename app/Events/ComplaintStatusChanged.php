<?php

namespace App\Events;

use App\Models\Complaint;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaint;
    public $oldStatus;
    public $newStatus;

    public function __construct(Complaint $complaint, $oldStatus, $newStatus)
    {
        $this->complaint = $complaint;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    // Broadcast to specific user private channel
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->complaint->user_id),
        ];
    }

    // Data to broadcast
    public function broadcastWith(): array
    {
        return [
            'complaint_id' => $this->complaint->complaint_id,
            'ticket_id' => $this->complaint->ticket_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'keluhan' => $this->complaint->keluhan,
            'priority' => $this->complaint->priority,
            'updated_at' => $this->complaint->updated_at->toISOString(),
        ];
    }
}