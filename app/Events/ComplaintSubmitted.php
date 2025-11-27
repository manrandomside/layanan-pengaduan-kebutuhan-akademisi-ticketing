<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $complaintData;

    public function __construct($complaintData)
    {
        $this->complaintData = $complaintData;
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
        return is_array($this->complaintData) ? $this->complaintData : [
            'complaint_id' => $this->complaintData->complaint_id,
            'ticket_id' => $this->complaintData->ticket_id,
            'user_id' => $this->complaintData->user_id,
            'nama_lengkap' => $this->complaintData->nama_lengkap,
            'nim_nip' => $this->complaintData->nim_nip,
            'email' => $this->complaintData->email,
            'no_telepon' => $this->complaintData->no_telepon,
            'priority' => $this->complaintData->priority,
            'keluhan' => $this->complaintData->keluhan,
            'status_user' => $this->complaintData->status_user,
            'kelas' => $this->complaintData->kelas,
            'lab' => $this->complaintData->lab,
            'ruangan' => $this->complaintData->ruangan,
            'status' => $this->complaintData->status ?? 'waiting',
            'created_at' => $this->complaintData->created_at ?? now()->toISOString(),
        ];
    }
}