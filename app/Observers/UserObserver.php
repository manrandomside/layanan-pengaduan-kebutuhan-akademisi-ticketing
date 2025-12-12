<?php

namespace App\Observers;

use App\Models\User;
use App\Events\UserRegistered;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Broadcast event to admin channel for real-time update
        try {
            $eventData = [
                'user_id' => $user->user_id,
                'nama_lengkap' => $user->nama_lengkap,
                'nim_nip' => $user->nim_nip,
                'email' => $user->email,
                'no_telepon' => $user->no_telepon,
                'status' => $user->status,
                'is_active' => $user->is_active,
                'total_tickets' => $user->total_tickets,
                'daily_tickets' => $user->daily_tickets,
                'created_at' => $user->created_at->toISOString(),
            ];

            event(new UserRegistered($eventData));
            Log::info('UserRegistered event dispatched', ['user_id' => $user->user_id]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast UserRegistered', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "forceDeleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}