<?php

namespace App\Observers;

use App\Models\FeedbackResponse;
use App\Models\Notification;
use App\Events\FeedbackReplied;

class FeedbackResponseObserver
{
    public function created(FeedbackResponse $feedbackResponse): void
    {
        $feedbackResponse->load('feedback.complaint');

        if ($feedbackResponse->feedback) {
            Notification::create([
                'user_id' => $feedbackResponse->feedback->user_id,
                'type' => 'feedback_replied',
                'title' => 'Admin Membalas Feedback',
                'message' => "Admin telah menanggapi feedback Anda pada keluhan [{$feedbackResponse->feedback->complaint->ticket_id}]",
                'related_complaint_id' => $feedbackResponse->feedback->complaint_id,
                'is_read' => 'unread',
            ]);

            broadcast(new FeedbackReplied($feedbackResponse));
        }
    }

    public function updated(FeedbackResponse $feedbackResponse): void
    {
        //
    }

    public function deleted(FeedbackResponse $feedbackResponse): void
    {
        //
    }

    public function restored(FeedbackResponse $feedbackResponse): void
    {
        //
    }

    public function forceDeleted(FeedbackResponse $feedbackResponse): void
    {
        //
    }
}