<?php

namespace App\Observers;

use App\Models\Complaint;
use App\Models\Notification;
use App\Models\ComplaintStatusHistory;
use App\Models\Admin;
use App\Events\ComplaintSubmitted;
use App\Events\ComplaintStatusChanged;
use Illuminate\Support\Facades\Log;

class ComplaintObserver
{
    public function created(Complaint $complaint): void
    {
        // Create notifications for all admins
        $admins = Admin::all();

        foreach ($admins as $admin) {
            Notification::create([
                'admin_id' => $admin->admin_id,
                'type' => 'complaint_submitted',
                'title' => 'Keluhan Baru',
                'message' => "Keluhan baru dari {$complaint->nama_lengkap} - Tiket: {$complaint->ticket_id}",
                'related_complaint_id' => $complaint->complaint_id,
                'is_read' => 'unread',
            ]);
        }

        // Broadcast event to admin channel
        try {
            $eventData = [
                'complaint_id' => $complaint->complaint_id,
                'ticket_id' => $complaint->ticket_id,
                'user_id' => $complaint->user_id,
                'nama_lengkap' => $complaint->nama_lengkap,
                'nim_nip' => $complaint->nim_nip,
                'email' => $complaint->email,
                'no_telepon' => $complaint->no_telepon,
                'priority' => $complaint->priority,
                'keluhan' => $complaint->keluhan,
                'status_user' => $complaint->status_user,
                'kelas' => $complaint->kelas,
                'lab' => $complaint->lab,
                'ruangan' => $complaint->ruangan,
                'status' => $complaint->status,
                'created_at' => $complaint->created_at->toISOString(),
            ];

            event(new ComplaintSubmitted($eventData));
            Log::info('ComplaintSubmitted event dispatched', ['complaint_id' => $complaint->complaint_id]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast ComplaintSubmitted', ['error' => $e->getMessage()]);
        }
    }

    public function updated(Complaint $complaint): void
    {
        if ($complaint->isDirty('status')) {
            $oldStatus = $complaint->getOriginal('status');
            $newStatus = $complaint->status;

            // Create notification for user
            Notification::create([
                'user_id' => $complaint->user_id,
                'type' => 'status_changed',
                'title' => 'Status Keluhan Diperbarui',
                'message' => "Status keluhan [{$complaint->ticket_id}] telah diubah menjadi " . $this->getStatusText($newStatus),
                'related_complaint_id' => $complaint->complaint_id,
                'is_read' => 'unread',
            ]);

            // Save status history
            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->complaint_id,
                'status_lama' => $oldStatus,
                'status_baru' => $newStatus,
            ]);

            // Broadcast event to user channel
            try {
                event(new ComplaintStatusChanged(
                    $complaint->complaint_id,
                    $complaint->ticket_id,
                    $complaint->user_id,
                    $oldStatus,
                    $newStatus
                ));
                Log::info('ComplaintStatusChanged event dispatched', [
                    'complaint_id' => $complaint->complaint_id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to broadcast ComplaintStatusChanged', ['error' => $e->getMessage()]);
            }
        }
    }

    public function deleted(Complaint $complaint): void
    {
        //
    }

    public function restored(Complaint $complaint): void
    {
        //
    }

    public function forceDeleted(Complaint $complaint): void
    {
        //
    }

    private function getStatusText(string $status): string
    {
        $statusMap = [
            'waiting' => 'Menunggu',
            'on_progress' => 'Sedang Diproses',
            'done' => 'Selesai',
        ];

        return $statusMap[$status] ?? $status;
    }
}