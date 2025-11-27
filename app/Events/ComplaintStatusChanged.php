<?php

namespace App\Events;

use App\Models\Complaint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaint;
    public $oldStatus;
    public $newStatus;

    public function __construct(Complaint $complaint, string $oldStatus, string $newStatus)
    {
        $this->complaint = $complaint;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->complaint->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ComplaintStatusChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'complaint_id' => $this->complaint->complaint_id,
            'ticket_id' => $this->complaint->ticket_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
        ];
    }
}