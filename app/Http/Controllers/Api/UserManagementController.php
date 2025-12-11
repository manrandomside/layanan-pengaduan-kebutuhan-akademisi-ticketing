<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    // Get all users for admin with search, filter, and pagination
    public function getAllUsers(Request $request)
    {
        $status = $request->query('status');
        $isActive = $request->query('is_active');
        $search = $request->query('search');
        $perPage = $request->query('per_page', 20);

        $query = User::query();

        // Filter by status (dosen, asdos, staff, mahasiswa)
        if ($status && in_array($status, ['dosen', 'asdos', 'staff', 'mahasiswa'])) {
            $query->where('status', $status);
        }

        // Filter by is_active (active, inactive)
        if ($isActive && in_array($isActive, ['active', 'inactive'])) {
            $query->where('is_active', $isActive);
        }

        // Search across multiple fields
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nim_nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('no_telepon', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->select([
                'user_id',
                'nama_lengkap',
                'nim_nip',
                'email',
                'no_telepon',
                'status',
                'total_tickets',
                'daily_tickets',
                'is_active',
                'created_at',
                'updated_at'
            ])
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ]
        ], 200);
    }

    // Get user detail
    public function getUserDetail(Request $request, $id)
    {
        $user = User::select([
                'user_id',
                'nama_lengkap',
                'nim_nip',
                'email',
                'no_telepon',
                'status',
                'total_tickets',
                'daily_tickets',
                'last_ticket_reset',
                'is_active',
                'created_at',
                'updated_at'
            ])
            ->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    // Create new user by admin
    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'nim_nip' => 'required|string|max:50|unique:users,nim_nip',
            'email' => 'required|email|max:255|unique:users,email',
            'no_telepon' => 'required|string|max:20',
            'status' => 'required|in:dosen,asdos,staff,mahasiswa',
            'password' => 'required|string|min:6',
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

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    // Deactivate user account
    public function deactivateUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->is_active === 'inactive') {
            return response()->json([
                'success' => false,
                'message' => 'User is already deactivated'
            ], 400);
        }

        $user->update([
            'is_active' => 'inactive',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User deactivated successfully',
            'data' => $user
        ], 200);
    }

    // Activate user account
    public function activateUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->is_active === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'User is already active'
            ], 400);
        }

        $user->update([
            'is_active' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully',
            'data' => $user
        ], 200);
    }
}