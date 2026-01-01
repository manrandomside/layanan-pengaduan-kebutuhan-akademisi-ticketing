<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Admin;
use App\Models\EmailVerification;
use App\Mail\PasswordResetTokenMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    /**
     * Get authenticated user/admin info
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        $role = $user instanceof Admin ? 'admin' : 'user';
        
        if ($role === 'user' && $user->is_active !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated by admin'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'role' => $role,
            ]
        ], 200);
    }

    /**
     * Register new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'nim_nip' => 'required|string|max:50|unique:users,nim_nip',
            'email' => 'required|email|max:255|unique:users,email',
            'no_telepon' => 'required|string|max:20|unique:users,no_telepon',
            'status' => 'required|in:dosen,asdos,staff,mahasiswa',
            'password' => 'required|string|min:6',
        ], [
            'nim_nip.unique' => 'NIM/NIP sudah terdaftar',
            'email.unique' => 'Email sudah terdaftar, silakan gunakan email lain',
            'no_telepon.unique' => 'No telepon sudah terdaftar, silakan gunakan no telepon lain',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'nim_nip' => $request->nim_nip,
            'email' => $request->email,
            'no_telepon' => $request->no_telepon,
            'status' => $request->status,
            'password' => Hash::make($request->password),
            'total_tickets' => 3,
            'daily_tickets' => 3,
            'last_ticket_reset' => now()->toDateString(),
            'is_active' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Login user with no_telepon
     */
    public function loginUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'no_telepon' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('no_telepon', $request->no_telepon)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if ($user->is_active !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Akun kamu dinonaktifkan oleh admin'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ], 200);
    }

    /**
     * Login admin with nama
     */
    public function loginAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = Admin::where('nama', $request->nama)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $admin->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin login successful',
            'data' => [
                'admin' => $admin,
                'token' => $token,
            ]
        ], 200);
    }

    /**
     * Logout user or admin
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    /**
     * Forgot password - Send 6 digit token to email
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if email exists in users table
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak terdaftar'
            ], 404);
        }

        // Generate 6 digit token
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete previous pending tokens for this email
        EmailVerification::where('email', $request->email)
            ->where('type', 'password_reset')
            ->where('is_verified', 'pending')
            ->delete();

        // Save token to email_verifications table
        EmailVerification::create([
            'user_id' => null,
            'email' => $request->email,
            'no_telepon' => null,
            'token' => $token,
            'type' => 'password_reset',
            'is_verified' => 'pending',
            'expires_at' => now()->addHours(24),
        ]);

        // Send email with token
        try {
            Mail::to($request->email)->send(
                new PasswordResetTokenMail($user->nama_lengkap, $token)
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email. Silakan coba lagi.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token reset password telah dikirim ke email Anda'
        ], 200);
    }

    /**
     * Verify reset password token
     */
    public function verifyResetToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find valid token
        $verification = EmailVerification::where('email', $request->email)
            ->where('token', $request->token)
            ->where('type', 'password_reset')
            ->where('is_verified', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa'
            ], 400);
        }

        // Mark token as verified
        $verification->update([
            'is_verified' => 'verified',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Token berhasil diverifikasi',
            'data' => [
                'email' => $request->email
            ]
        ], 200);
    }

    /**
     * Reset password after token verified
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'new_password.min' => 'Password minimal 6 karakter',
            'new_password.confirmed' => 'Konfirmasi password tidak cocok',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if token is verified
        $verification = EmailVerification::where('email', $request->email)
            ->where('token', $request->token)
            ->where('type', 'password_reset')
            ->where('is_verified', 'verified')
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid. Silakan ulangi proses reset password.'
            ], 400);
        }

        // Find user and update password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        // Delete used token
        $verification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan login dengan password baru.'
        ], 200);
    }
}