<?php

namespace App\Observers;

use App\Models\Feedback;
use App\Events\FeedbackSubmitted;

class FeedbackObserver
{
    public function created(Feedback $feedback): void
    {
        broadcast(new FeedbackSubmitted($feedback));
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