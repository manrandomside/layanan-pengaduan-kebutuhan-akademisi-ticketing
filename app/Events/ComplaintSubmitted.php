<?php

namespace App\Events;

use App\Models\Complaint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaint;

    public function __construct(Complaint $complaint)
    {
        $this->complaint = $complaint->load('user');
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin-channel'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ComplaintSubmitted';
    }

    public function broadcastWith(): array
    {
        return [
            'complaint_id' => $this->complaint->complaint_id,
            'ticket_id' => $this->complaint->ticket_id,
            'user_id' => $this->complaint->user_id,
            'nama_lengkap' => $this->complaint->nama_lengkap,
            'nim_nip' => $this->complaint->nim_nip,
            'email' => $this->complaint->email,
            'no_telepon' => $this->complaint->no_telepon,
            'priority' => $this->complaint->priority,
            'keluhan' => $this->complaint->keluhan,
            'status_user' => $this->complaint->status_user,
            'kelas' => $this->complaint->kelas,
            'lab' => $this->complaint->lab,
            'ruangan' => $this->complaint->ruangan,
            'created_at' => $this->complaint->created_at->toISOString(),
        ];
    }
}