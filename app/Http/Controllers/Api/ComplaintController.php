<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    /**
     * Submit new complaint using one ticket
     */
    public function submitComplaint(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'ticket_id' => 'required|string|exists:tickets,ticket_id',
            'kelas' => 'nullable|string|max:100',
            'lab' => 'nullable|string|max:100',
            'ruangan' => 'nullable|string|max:100',
            'keluhan' => 'required|string',
            'priority' => 'required|in:low,middle,high',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = Ticket::where('ticket_id', $request->ticket_id)
            ->where('user_id', $user->user_id)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found or does not belong to you'
            ], 404);
        }

        if ($ticket->is_used === 'used') {
            return response()->json([
                'success' => false,
                'message' => 'Ticket has already been used'
            ], 400);
        }

        $complaint = Complaint::create([
            'ticket_id' => $request->ticket_id,
            'user_id' => $user->user_id,
            'nama_lengkap' => $user->nama_lengkap,
            'nim_nip' => $user->nim_nip,
            'email' => $user->email,
            'no_telepon' => $user->no_telepon,
            'status_user' => $user->status,
            'kelas' => $request->kelas,
            'lab' => $request->lab,
            'ruangan' => $request->ruangan,
            'keluhan' => $request->keluhan,
            'priority' => $request->priority,
            'status' => 'waiting',
        ]);

        $ticket->update([
            'is_used' => 'used',
            'used_at' => now(),
        ]);

        $user->decrement('total_tickets');

        return response()->json([
            'success' => true,
            'message' => 'Complaint submitted successfully',
            'data' => $complaint
        ], 201);
    }

    /**
     * Get my complaints for authenticated user
     */
    public function getMyComplaints(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Complaint::where('user_id', $user->user_id);

        if ($status && in_array($status, ['waiting', 'on_progress', 'done'])) {
            $query->where('status', $status);
        }

        $complaints = $query->orderBy('created_at', 'desc')
            ->with(['feedback'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $complaints
        ], 200);
    }

    /**
     * Get complaint detail
     */
    public function getComplaintDetail(Request $request, $id)
    {
        $complaint = Complaint::with(['user', 'ticket', 'statusHistories', 'feedback.responses.admin'])
            ->find($id);

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $complaint
        ], 200);
    }

    /**
     * Search complaint history (all complaints, not just user's)
     */
    public function searchComplaintHistory(Request $request)
    {
        $keyword = $request->query('keyword');
        $limit = $request->query('limit', 20);

        $query = Complaint::query()
            ->where('created_at', '>=', now()->subMonth())
            ->orderBy('created_at', 'desc');

        if ($keyword) {
            $query->where(function($q) use ($keyword) {
                $q->where('keluhan', 'like', "%{$keyword}%")
                  ->orWhere('kelas', 'like', "%{$keyword}%")
                  ->orWhere('lab', 'like', "%{$keyword}%")
                  ->orWhere('ruangan', 'like', "%{$keyword}%");
            });
        }

        $complaints = $query->with(['feedback'])->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $complaints
        ], 200);
    }

    /**
     * Get all complaints for admin
     */
    public function getAllComplaints(Request $request)
    {
        $status = $request->query('status');
        $priority = $request->query('priority');

        $query = Complaint::query();

        if ($status && in_array($status, ['waiting', 'on_progress', 'done'])) {
            $query->where('status', $status);
        }

        if ($priority && in_array($priority, ['low', 'middle', 'high'])) {
            $query->where('priority', $priority);
        }

        $complaints = $query->orderBy('created_at', 'desc')
            ->with(['user', 'feedback'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $complaints
        ], 200);
    }

    /**
     * Update complaint status by admin
     */
    public function updateComplaintStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:waiting,on_progress,done',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::find($id);

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found'
            ], 404);
        }

        $complaint->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Complaint status updated successfully',
            'data' => $complaint
        ], 200);
    }
}