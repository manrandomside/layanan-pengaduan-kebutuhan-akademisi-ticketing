<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Feedback;
use App\Models\User;

class PublicStatsController extends Controller
{
    public function getStats()
    {
        $complaintsResolved = Complaint::where('status', 'done')->count();
        $totalComplaints = Complaint::count();
        $totalUsers = User::where('is_active', 'active')->count();

        $avgRating = Feedback::avg('rating');
        $feedbackCount = Feedback::count();

        // Convert average rating (1-5) to percentage
        $satisfactionPercent = $feedbackCount > 0
            ? round(($avgRating / 5) * 100)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'complaints_resolved' => $complaintsResolved,
                'total_complaints' => $totalComplaints,
                'satisfaction_percent' => $satisfactionPercent,
                'total_users' => $totalUsers,
                'feedback_count' => $feedbackCount,
            ],
        ]);
    }
}
