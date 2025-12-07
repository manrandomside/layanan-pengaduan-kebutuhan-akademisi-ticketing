<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    public function submitComplaint(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'ticket_id' => 'nullable|string|exists:tickets,ticket_id',
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

        if ($request->ticket_id) {
            $ticket = Ticket::where('ticket_id', $request->ticket_id)
                ->where('user_id', $user->user_id)
                ->where('is_used', 'available')
                ->first();
        } else {
            $ticket = Ticket::where('user_id', $user->user_id)
                ->where('is_used', 'available')
                ->orderBy('claimed_at', 'asc')
                ->first();
        }

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada tiket tersedia. Silakan claim tiket terlebih dahulu.'
            ], 404);
        }

        $complaint = Complaint::create([
            'ticket_id' => $ticket->ticket_id,
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
            'message' => 'Keluhan berhasil diajukan',
            'data' => $complaint
        ], 201);
    }

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

    // Search complaint history for user dashboard (only visible complaints)
    public function searchComplaintHistory(Request $request)
    {
        $keyword = $request->query('keyword');
        $limit = $request->query('limit', 20);

        $query = Complaint::query()
            ->where('is_hidden', 'visible')
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

    // Get all complaints for admin (show all including hidden)
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

    // Toggle hide/unhide complaint (admin only)
    public function toggleHideComplaint(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'is_hidden' => 'required|in:visible,hidden',
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
            'is_hidden' => $request->is_hidden,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Complaint visibility updated successfully',
            'data' => $complaint
        ], 200);
    }
}