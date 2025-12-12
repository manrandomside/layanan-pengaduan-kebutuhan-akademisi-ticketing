<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Models\Complaint;
use App\Models\Feedback;
use App\Models\FeedbackResponse;
use App\Models\User;
use App\Observers\ComplaintObserver;
use App\Observers\FeedbackObserver;
use App\Observers\FeedbackResponseObserver;
use App\Observers\UserObserver;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    public function boot(): void
    {
        // Register model observers
        Complaint::observe(ComplaintObserver::class);
        Feedback::observe(FeedbackObserver::class);
        FeedbackResponse::observe(FeedbackResponseObserver::class);
        User::observe(UserObserver::class);
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}