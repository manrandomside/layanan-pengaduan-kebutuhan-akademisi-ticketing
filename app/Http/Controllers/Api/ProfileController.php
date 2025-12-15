<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Admin;
use App\Models\EmailVerification;
use App\Mail\VerificationTokenMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get user profile
     */
    public function getUserProfile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    /**
     * Update user profile
     */
    public function updateUserProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'nullable|string|max:255',
            'nim_nip' => 'nullable|string|max:50|unique:users,nim_nip,' . $user->user_id . ',user_id',
            'status' => 'nullable|in:dosen,asdos,staff,mahasiswa',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];

        if ($request->has('nama_lengkap')) {
            $updateData['nama_lengkap'] = $request->nama_lengkap;
        }

        if ($request->has('nim_nip')) {
            $updateData['nim_nip'] = $request->nim_nip;
        }

        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user->fresh()
        ], 200);
    }

    /**
     * Change user password
     */
    public function changeUserPassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ], 200);
    }

    /**
     * Request email update - Token dikirim ke EMAIL BARU
     */
    public function requestEmailUpdate(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'new_email' => 'required|email|max:255|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate 6 digit token
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete pending verifications sebelumnya untuk user ini
        EmailVerification::where('user_id', $user->user_id)
            ->where('type', 'email')
            ->where('is_verified', 'pending')
            ->delete();

        EmailVerification::create([
            'user_id' => $user->user_id,
            'email' => $request->new_email,
            'token' => $token,
            'type' => 'email',
            'is_verified' => 'pending',
            'expires_at' => now()->addHours(24),
        ]);

        // Kirim email ke EMAIL BARU
        try {
            Mail::to($request->new_email)->send(
                new VerificationTokenMail($user->nama_lengkap, $token, 'email')
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email verifikasi. Silakan coba lagi.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token verifikasi telah dikirim ke email baru Anda.',
        ], 200);
    }

    /**
     * Verify and update email
     */
    public function verifyEmailUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $verification = EmailVerification::where('token', $request->token)
            ->where('type', 'email')
            ->where('is_verified', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa'
            ], 400);
        }

        $user = User::find($verification->user_id);

        $user->update([
            'email' => $verification->email,
        ]);

        $verification->update([
            'is_verified' => 'verified',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diperbarui',
            'data' => $user
        ], 200);
    }

    /**
     * Request phone update - Token dikirim ke EMAIL LAMA (email saat ini)
     */
    public function requestPhoneUpdate(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'new_no_telepon' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate 6 digit token
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete pending verifications sebelumnya untuk user ini
        EmailVerification::where('user_id', $user->user_id)
            ->where('type', 'phone')
            ->where('is_verified', 'pending')
            ->delete();

        EmailVerification::create([
            'user_id' => $user->user_id,
            'no_telepon' => $request->new_no_telepon,
            'token' => $token,
            'type' => 'phone',
            'is_verified' => 'pending',
            'expires_at' => now()->addHours(24),
        ]);

        // Kirim email ke EMAIL LAMA (email saat ini)
        try {
            Mail::to($user->email)->send(
                new VerificationTokenMail($user->nama_lengkap, $token, 'phone')
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email verifikasi. Silakan coba lagi.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token verifikasi telah dikirim ke email Anda.',
        ], 200);
    }

    /**
     * Verify and update phone number
     */
    public function verifyPhoneUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $verification = EmailVerification::where('token', $request->token)
            ->where('type', 'phone')
            ->where('is_verified', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa'
            ], 400);
        }

        $user = User::find($verification->user_id);

        $user->update([
            'no_telepon' => $verification->no_telepon,
        ]);

        $verification->update([
            'is_verified' => 'verified',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nomor telepon berhasil diperbarui',
            'data' => $user
        ], 200);
    }

    /**
     * Get admin profile
     */
    public function getAdminProfile(Request $request)
    {
        $admin = $request->user();

        return response()->json([
            'success' => true,
            'data' => $admin
        ], 200);
    }

    /**
     * Update admin profile
     */
    public function updateAdminProfile(Request $request)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:100|unique:admins,nama,' . $admin->admin_id . ',admin_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin->update([
            'nama' => $request->nama,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin profile updated successfully',
            'data' => $admin->fresh()
        ], 200);
    }

    /**
     * Change admin password
     */
    public function changeAdminPassword(Request $request)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin password changed successfully'
        ], 200);
    }
}