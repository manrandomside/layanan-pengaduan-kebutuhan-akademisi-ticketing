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
    public function created(Complaint $complaint): void
    {
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

        broadcast(new ComplaintSubmitted($complaint));
    }

    public function updated(Complaint $complaint): void
    {
        if ($complaint->isDirty('status')) {
            $oldStatus = $complaint->getOriginal('status');
            $newStatus = $complaint->status;

            Notification::create([
                'user_id' => $complaint->user_id,
                'type' => 'status_changed',
                'title' => 'Status Keluhan Diperbarui',
                'message' => "Status keluhan [{$complaint->ticket_id}] telah diubah menjadi " . $this->getStatusText($newStatus),
                'related_complaint_id' => $complaint->complaint_id,
                'is_read' => 'unread',
            ]);

            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->complaint_id,
                'status_lama' => $oldStatus,
                'status_baru' => $newStatus,
            ]);

            broadcast(new ComplaintStatusChanged($complaint, $oldStatus, $newStatus));
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