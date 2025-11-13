<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\FeedbackResponse;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Submit feedback and rating for completed complaint
     */
    public function submitFeedback(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'complaint_id' => 'required|integer|exists:complaints,complaint_id',
            'rating' => 'required|integer|min:1|max:5',
            'feedback_text' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::find($request->complaint_id);

        if ($complaint->user_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only give feedback to your own complaint'
            ], 403);
        }

        if ($complaint->status !== 'done') {
            return response()->json([
                'success' => false,
                'message' => 'You can only give feedback to completed complaints'
            ], 400);
        }

        $existingFeedback = Feedback::where('complaint_id', $request->complaint_id)->first();

        if ($existingFeedback) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback already submitted for this complaint'
            ], 400);
        }

        $feedback = Feedback::create([
            'complaint_id' => $request->complaint_id,
            'user_id' => $user->user_id,
            'rating' => $request->rating,
            'feedback_text' => $request->feedback_text,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully',
            'data' => $feedback
        ], 201);
    }

    /**
     * Get my feedbacks for authenticated user
     */
    public function getMyFeedbacks(Request $request)
    {
        $user = $request->user();

        $feedbacks = Feedback::where('user_id', $user->user_id)
            ->with(['complaint', 'responses.admin'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $feedbacks
        ], 200);
    }

    /**
     * Get all feedbacks for admin
     */
    public function getAllFeedbacks(Request $request)
    {
        $rating = $request->query('rating');

        $query = Feedback::with(['user', 'complaint', 'responses.admin']);

        if ($rating && in_array($rating, [1, 2, 3, 4, 5])) {
            $query->where('rating', $rating);
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $feedbacks
        ], 200);
    }

    /**
     * Reply to feedback by admin
     */
    public function replyFeedback(Request $request, $feedbackId)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'response_text' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $feedback = Feedback::find($feedbackId);

        if (!$feedback) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback not found'
            ], 404);
        }

        $response = FeedbackResponse::create([
            'feedback_id' => $feedbackId,
            'admin_id' => $admin->admin_id,
            'response_text' => $request->response_text,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Response submitted successfully',
            'data' => $response
        ], 201);
    }

    /**
     * Get feedback detail with responses
     */
    public function getFeedbackDetail(Request $request, $id)
    {
        $feedback = Feedback::with(['user', 'complaint', 'responses.admin'])
            ->find($id);

        if (!$feedback) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $feedback
        ], 200);
    }
}