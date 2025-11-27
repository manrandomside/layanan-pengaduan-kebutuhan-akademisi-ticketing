<?php

namespace App\Observers;

use App\Models\Feedback;
use App\Events\FeedbackSubmitted;
use Illuminate\Support\Facades\Log;

class FeedbackObserver
{
    public function created(Feedback $feedback): void
    {
        // Broadcast event to admin channel
        try {
            $feedback->load('user', 'complaint');

            $userData = [
                'nama_lengkap' => $feedback->user->nama_lengkap ?? 'User',
                'nim_nip' => $feedback->user->nim_nip ?? '-',
                'status' => $feedback->user->status ?? '-',
            ];

            $complaintData = [
                'ticket_id' => $feedback->complaint->ticket_id ?? '-',
                'keluhan' => $feedback->complaint->keluhan ?? '-',
                'kelas' => $feedback->complaint->kelas ?? null,
                'lab' => $feedback->complaint->lab ?? null,
                'ruangan' => $feedback->complaint->ruangan ?? null,
            ];

            event(new FeedbackSubmitted(
                $feedback->feedback_id,
                $feedback->complaint_id,
                $feedback->user_id,
                $feedback->rating,
                $feedback->feedback_text,
                $userData,
                $complaintData,
                $feedback->created_at->toISOString()
            ));

            Log::info('FeedbackSubmitted event dispatched', ['feedback_id' => $feedback->feedback_id]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast FeedbackSubmitted', ['error' => $e->getMessage()]);
        }
    }

    public function updated(Feedback $feedback): void
    {
        //
    }

    public function deleted(Feedback $feedback): void
    {
        //
    }

    public function restored(Feedback $feedback): void
    {
        //
    }

    public function forceDeleted(Feedback $feedback): void
    {
        //
    }
}