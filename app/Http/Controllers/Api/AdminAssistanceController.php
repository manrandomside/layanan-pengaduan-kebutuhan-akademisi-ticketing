<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAssistanceRequest;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminAssistanceController extends Controller
{
    /**
     * Get all assistance requests with optional filters
     */
    public function index(Request $request)
    {
        $query = AdminAssistanceRequest::with(['user', 'processedByAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $requests = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ]
        ], 200);
    }

    /**
     * Get detail of specific assistance request
     */
    public function show($id)
    {
        $request = AdminAssistanceRequest::with(['user', 'processedByAdmin'])->find($id);

        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Request tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $request
        ], 200);
    }

    /**
     * Start processing a request (status: pending -> processing)
     */
    public function process(Request $request, $id)
    {
        $admin = $request->user();
        $assistanceRequest = AdminAssistanceRequest::find($id);

        if (!$assistanceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request tidak ditemukan'
            ], 404);
        }

        if ($assistanceRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Request ini sudah diproses sebelumnya'
            ], 400);
        }

        $assistanceRequest->update([
            'status' => 'processing',
            'processed_by_admin' => $admin->admin_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request sedang diproses',
            'data' => $assistanceRequest->fresh(['user', 'processedByAdmin'])
        ], 200);
    }

    /**
     * Reset user password and generate new one
     */
    public function resetPassword(Request $request, $id)
    {
        $admin = $request->user();
        $assistanceRequest = AdminAssistanceRequest::find($id);

        if (!$assistanceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request tidak ditemukan'
            ], 404);
        }

        if ($assistanceRequest->type !== 'password_reset') {
            return response()->json([
                'success' => false,
                'message' => 'Request ini bukan untuk reset password'
            ], 400);
        }

        if ($assistanceRequest->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Request ini sudah selesai diproses'
            ], 400);
        }

        // Find user by email
        $user = User::where('email', $assistanceRequest->email_registered)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Generate random password (8 characters: letters and numbers)
        $newPassword = Str::random(8);

        // Update user password
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Update request status
        $assistanceRequest->update([
            'status' => 'completed',
            'processed_by_admin' => $admin->admin_id,
            'admin_notes' => $request->admin_notes ?? 'Password berhasil direset',
        ]);

        // Create notification for user
        Notification::create([
            'user_id' => $user->user_id,
            'admin_id' => null,
            'type' => 'status_changed',
            'title' => 'Password Berhasil Direset',
            'message' => 'Password Anda telah direset oleh admin. Silakan cek WhatsApp untuk password baru.',
            'related_complaint_id' => null,
            'is_read' => 'unread',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset',
            'data' => [
                'new_password' => $newPassword,
                'user_name' => $user->nama_lengkap,
                'user_phone' => $user->no_telepon,
                'user_email' => $user->email,
            ]
        ], 200);
    }

    /**
     * Approve email or phone change request
     */
    public function approve(Request $request, $id)
    {
        $admin = $request->user();
        $assistanceRequest = AdminAssistanceRequest::find($id);

        if (!$assistanceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request tidak ditemukan'
            ], 404);
        }

        if (!in_array($assistanceRequest->type, ['email_change', 'phone_change'])) {
            return response()->json([
                'success' => false,
                'message' => 'Gunakan endpoint reset-password untuk request reset password'
            ], 400);
        }

        if ($assistanceRequest->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Request ini sudah selesai diproses'
            ], 400);
        }

        $user = User::find($assistanceRequest->user_id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Update user data based on type
        if ($assistanceRequest->type === 'email_change') {
            // Check if new email is still available
            $emailExists = User::where('email', $assistanceRequest->new_value)
                ->where('user_id', '!=', $user->user_id)
                ->exists();

            if ($emailExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email sudah digunakan oleh user lain'
                ], 400);
            }

            $oldValue = $user->email;
            $user->update(['email' => $assistanceRequest->new_value]);
            $notifMessage = "Email Anda telah diubah dari {$oldValue} menjadi {$assistanceRequest->new_value}";

        } else {
            // phone_change
            $phoneExists = User::where('no_telepon', $assistanceRequest->new_value)
                ->where('user_id', '!=', $user->user_id)
                ->exists();

            if ($phoneExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'No telepon sudah digunakan oleh user lain'
                ], 400);
            }

            $oldValue = $user->no_telepon;
            $user->update(['no_telepon' => $assistanceRequest->new_value]);
            $notifMessage = "No telepon Anda telah diubah dari {$oldValue} menjadi {$assistanceRequest->new_value}";
        }

        // Update request status
        $assistanceRequest->update([
            'status' => 'completed',
            'processed_by_admin' => $admin->admin_id,
            'admin_notes' => $request->admin_notes ?? 'Request disetujui',
        ]);

        // Create notification for user
        Notification::create([
            'user_id' => $user->user_id,
            'admin_id' => null,
            'type' => 'status_changed',
            'title' => $assistanceRequest->type === 'email_change' ? 'Email Berhasil Diubah' : 'No Telepon Berhasil Diubah',
            'message' => $notifMessage,
            'related_complaint_id' => null,
            'is_read' => 'unread',
        ]);

        return response()->json([
            'success' => true,
            'message' => $assistanceRequest->type === 'email_change' ? 'Email berhasil diubah' : 'No telepon berhasil diubah',
            'data' => $assistanceRequest->fresh(['user', 'processedByAdmin'])
        ], 200);
    }

    /**
     * Reject assistance request
     */
    public function reject(Request $request, $id)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'required|string|max:500',
        ], [
            'admin_notes.required' => 'Alasan penolakan wajib diisi',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $assistanceRequest = AdminAssistanceRequest::find($id);

        if (!$assistanceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request tidak ditemukan'
            ], 404);
        }

        if ($assistanceRequest->status === 'completed' || $assistanceRequest->status === 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Request ini sudah selesai diproses'
            ], 400);
        }

        $assistanceRequest->update([
            'status' => 'rejected',
            'processed_by_admin' => $admin->admin_id,
            'admin_notes' => $request->admin_notes,
        ]);

        // Create notification for user if user_id exists
        if ($assistanceRequest->user_id) {
            Notification::create([
                'user_id' => $assistanceRequest->user_id,
                'admin_id' => null,
                'type' => 'status_changed',
                'title' => 'Request Ditolak',
                'message' => "Request {$assistanceRequest->type_label} Anda ditolak. Alasan: {$request->admin_notes}",
                'related_complaint_id' => null,
                'is_read' => 'unread',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Request berhasil ditolak',
            'data' => $assistanceRequest->fresh(['user', 'processedByAdmin'])
        ], 200);
    }

    /**
     * Mark request as completed (for manual completion)
     */
    public function complete(Request $request, $id)
    {
        $admin = $request->user();
        $assistanceRequest = AdminAssistanceRequest::find($id);

        if (!$assistanceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request tidak ditemukan'
            ], 404);
        }

        if ($assistanceRequest->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Request ini sudah selesai'
            ], 400);
        }

        $assistanceRequest->update([
            'status' => 'completed',
            'processed_by_admin' => $admin->admin_id,
            'admin_notes' => $request->admin_notes ?? 'Request selesai diproses',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request berhasil ditandai selesai',
            'data' => $assistanceRequest->fresh(['user', 'processedByAdmin'])
        ], 200);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        $stats = [
            'total' => AdminAssistanceRequest::count(),
            'pending' => AdminAssistanceRequest::where('status', 'pending')->count(),
            'processing' => AdminAssistanceRequest::where('status', 'processing')->count(),
            'completed' => AdminAssistanceRequest::where('status', 'completed')->count(),
            'rejected' => AdminAssistanceRequest::where('status', 'rejected')->count(),
            'by_type' => [
                'password_reset' => AdminAssistanceRequest::where('type', 'password_reset')->count(),
                'email_change' => AdminAssistanceRequest::where('type', 'email_change')->count(),
                'phone_change' => AdminAssistanceRequest::where('type', 'phone_change')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }
}