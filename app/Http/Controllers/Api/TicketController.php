<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    /**
     * Claim tickets for authenticated user
     */
    public function claimTickets(Request $request)
    {
        $user = $request->user();

        $this->checkAndResetDailyTickets($user);

        if ($user->daily_tickets <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Daily ticket limit reached. You can claim tickets again tomorrow.'
            ], 403);
        }

        if ($user->total_tickets >= 50) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum ticket limit reached (50 tickets). Please use your existing tickets.'
            ], 403);
        }

        $claimableCount = min($user->daily_tickets, 3, 50 - $user->total_tickets);

        $tickets = [];
        for ($i = 0; $i < $claimableCount; $i++) {
            $ticketId = $this->generateTicketId();
            
            $ticket = Ticket::create([
                'ticket_id' => $ticketId,
                'user_id' => $user->user_id,
                'is_used' => 'available',
                'claimed_at' => now(),
            ]);

            $tickets[] = $ticket;
        }

        $user->increment('total_tickets', $claimableCount);
        $user->decrement('daily_tickets', $claimableCount);

        return response()->json([
            'success' => true,
            'message' => "Successfully claimed {$claimableCount} ticket(s)",
            'data' => [
                'tickets' => $tickets,
                'total_tickets' => $user->total_tickets,
                'daily_tickets' => $user->daily_tickets,
            ]
        ], 201);
    }

    /**
     * Get ticket balance for authenticated user
     */
    public function getTicketBalance(Request $request)
    {
        $user = $request->user();

        $this->checkAndResetDailyTickets($user);

        $availableTickets = Ticket::where('user_id', $user->user_id)
            ->where('is_used', 'available')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_tickets' => $user->total_tickets,
                'daily_tickets' => $user->daily_tickets,
                'available_tickets' => $availableTickets,
                'last_ticket_reset' => $user->last_ticket_reset,
            ]
        ], 200);
    }

    /**
     * Generate unique ticket ID with format T000001
     */
    private function generateTicketId()
    {
        $lastTicket = Ticket::orderBy('ticket_id', 'desc')->first();
        
        if (!$lastTicket) {
            return 'T000001';
        }

        $lastNumber = (int) substr($lastTicket->ticket_id, 1);
        $newNumber = $lastNumber + 1;

        return 'T' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check and reset daily tickets if needed
     */
    private function checkAndResetDailyTickets(User $user)
    {
        $today = now()->toDateString();

        if ($user->last_ticket_reset !== $today) {
            $user->update([
                'daily_tickets' => 3,
                'last_ticket_reset' => $today,
            ]);
            $user->refresh();
        }
    }

    /**
     * Reset daily tickets for all users (called by scheduler)
     */
    public function resetAllDailyTickets()
    {
        User::query()->update([
            'daily_tickets' => 3,
            'last_ticket_reset' => now()->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Daily tickets reset for all users'
        ], 200);
    }
}