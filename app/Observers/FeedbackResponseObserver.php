<?php

namespace App\Observers;

use App\Models\FeedbackResponse;
use App\Models\Notification;
use App\Events\FeedbackReplied;
use Illuminate\Support\Facades\Log;

class FeedbackResponseObserver
{
    public function created(FeedbackResponse $feedbackResponse): void
    {
        $feedbackResponse->load('feedback.complaint', 'admin');

        if ($feedbackResponse->feedback && $feedbackResponse->feedback->complaint) {
            // Create notification for user
            Notification::create([
                'user_id' => $feedbackResponse->feedback->user_id,
                'type' => 'feedback_replied',
                'title' => 'Admin Membalas Feedback',
                'message' => "Admin telah menanggapi feedback Anda pada keluhan [{$feedbackResponse->feedback->complaint->ticket_id}]",
                'related_complaint_id' => $feedbackResponse->feedback->complaint_id,
                'is_read' => 'unread',
            ]);

            // Broadcast event to user channel
            try {
                event(new FeedbackReplied(
                    $feedbackResponse->response_id,
                    $feedbackResponse->feedback_id,
                    $feedbackResponse->feedback->complaint_id,
                    $feedbackResponse->feedback->complaint->ticket_id,
                    $feedbackResponse->feedback->complaint->user_id,
                    $feedbackResponse->response_text,
                    $feedbackResponse->admin->nama ?? 'Admin',
                    $feedbackResponse->created_at->toISOString()
                ));

                Log::info('FeedbackReplied event dispatched', ['response_id' => $feedbackResponse->response_id]);
            } catch (\Exception $e) {
                Log::error('Failed to broadcast FeedbackReplied', ['error' => $e->getMessage()]);
            }
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