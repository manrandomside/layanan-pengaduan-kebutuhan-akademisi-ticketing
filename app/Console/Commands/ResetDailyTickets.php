<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ResetDailyTickets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tickets:reset-daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset daily tickets for all users to 3';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now()->toDateString();

        $updatedCount = User::where('last_ticket_reset', '!=', $today)
            ->update([
                'daily_tickets' => 3,
                'last_ticket_reset' => $today,
            ]);

        $this->info("Daily tickets reset for {$updatedCount} users.");

        return Command::SUCCESS;
    }
}