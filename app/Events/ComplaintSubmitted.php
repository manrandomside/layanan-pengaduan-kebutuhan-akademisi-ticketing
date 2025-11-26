<?php

namespace App\Events;

use App\Models\Complaint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaint;

    public function __construct(Complaint $complaint)
    {
        $this->complaint = $complaint;
    }

    // Broadcast to admin channel
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-channel'),
        ];
    }

    // Data to broadcast
    public function broadcastWith(): array
    {
        return [
            'complaint_id' => $this->complaint->complaint_id,
            'ticket_id' => $this->complaint->ticket_id,
            'nama_lengkap' => $this->complaint->nama_lengkap,
            'nim_nip' => $this->complaint->nim_nip,
            'priority' => $this->complaint->priority,
            'keluhan' => $this->complaint->keluhan,
            'created_at' => $this->complaint->created_at->toISOString(),
        ];
    }
}