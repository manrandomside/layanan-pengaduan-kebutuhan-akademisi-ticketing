<?php

namespace App\Observers;

use App\Models\Complaint;
use App\Models\Notification;
use App\Models\ComplaintStatusHistory;
use App\Models\Admin;
use App\Events\ComplaintSubmitted;
use App\Events\ComplaintStatusChanged;

class ComplaintObserver
{
    /**
     * Handle the Complaint "created" event.
     */
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

        // Broadcast event to all admins
        broadcast(new ComplaintSubmitted($complaint));
    }

    /**
     * Handle the Complaint "updated" event.
     */
    public function updated(Complaint $complaint): void
    {
        if ($complaint->wasChanged('status')) {
            $oldStatus = $complaint->getOriginal('status');
            $newStatus = $complaint->status;

            // Create notification for user
            Notification::create([
                'user_id' => $complaint->user_id,
                'type' => 'status_changed',
                'title' => 'Status Keluhan Berubah',
                'message' => "Status keluhan Anda berubah dari {$oldStatus} menjadi {$newStatus}",
                'related_complaint_id' => $complaint->complaint_id,
                'is_read' => 'unread',
            ]);

            // Save status history
            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->complaint_id,
                'status_lama' => $oldStatus,
                'status_baru' => $newStatus,
            ]);

            // Broadcast event to specific user
            broadcast(new ComplaintStatusChanged($complaint, $oldStatus, $newStatus));
        }
    }

    /**
     * Handle the Complaint "deleted" event.
     */
    public function deleted(Complaint $complaint): void
    {
        //
    }

    /**
     * Handle the Complaint "restored" event.
     */
    public function restored(Complaint $complaint): void
    {
        //
    }

    /**
     * Handle the Complaint "force deleted" event.
     */
    public function forceDeleted(Complaint $complaint): void
    {
        //
    }
}