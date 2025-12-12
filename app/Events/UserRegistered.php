<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRegistered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userData;

    /**
     * Create a new event instance.
     */
    public function __construct($userData)
    {
        $this->userData = $userData;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-channel'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'UserRegistered';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return is_array($this->userData) ? $this->userData : [
            'user_id' => $this->userData->user_id ?? null,
            'nama_lengkap' => $this->userData->nama_lengkap ?? null,
            'nim_nip' => $this->userData->nim_nip ?? null,
            'email' => $this->userData->email ?? null,
            'no_telepon' => $this->userData->no_telepon ?? null,
            'status' => $this->userData->status ?? null,
            'is_active' => $this->userData->is_active ?? 'active',
            'total_tickets' => $this->userData->total_tickets ?? 3,
            'daily_tickets' => $this->userData->daily_tickets ?? 3,
            'created_at' => $this->userData->created_at ?? now()->toISOString(),
        ];
    }
}