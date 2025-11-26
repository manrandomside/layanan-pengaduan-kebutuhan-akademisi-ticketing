<?php

namespace App\Observers;

use App\Models\FeedbackResponse;
use App\Models\Notification;
use App\Models\Feedback;
use App\Events\FeedbackReplied;

class FeedbackResponseObserver
{
    /**
     * Handle the FeedbackResponse "created" event.
     */
    public function created(FeedbackResponse $feedbackResponse): void
    {
        $feedback = Feedback::find($feedbackResponse->feedback_id);

        if ($feedback) {
            // Create notification for user
            Notification::create([
                'user_id' => $feedback->user_id,
                'type' => 'feedback_replied',
                'title' => 'Admin Menanggapi Feedback Anda',
                'message' => 'Admin telah memberikan tanggapan terhadap feedback Anda',
                'related_complaint_id' => $feedback->complaint_id,
                'is_read' => 'unread',
            ]);

            // Broadcast event to specific user
            broadcast(new FeedbackReplied($feedbackResponse));
        }
    }

    /**
     * Handle the FeedbackResponse "updated" event.
     */
    public function updated(FeedbackResponse $feedbackResponse): void
    {
        //
    }

    /**
     * Handle the FeedbackResponse "deleted" event.
     */
    public function deleted(FeedbackResponse $feedbackResponse): void
    {
        //
    }

    /**
     * Handle the FeedbackResponse "restored" event.
     */
    public function restored(FeedbackResponse $feedbackResponse): void
    {
        //
    }

    /**
     * Handle the FeedbackResponse "force deleted" event.
     */
    public function forceDeleted(FeedbackResponse $feedbackResponse): void
    {
        //
    }
}