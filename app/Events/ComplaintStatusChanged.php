<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaintId;
    public $ticketId;
    public $userId;
    public $oldStatus;
    public $newStatus;

    public function __construct($complaintId, $ticketId, $userId, $oldStatus, $newStatus)
    {
        $this->complaintId = $complaintId;
        $this->ticketId = $ticketId;
        $this->userId = $userId;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ComplaintStatusChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'complaint_id' => $this->complaintId,
            'ticket_id' => $this->ticketId,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'timestamp' => now()->toISOString(),
        ];
    }
}