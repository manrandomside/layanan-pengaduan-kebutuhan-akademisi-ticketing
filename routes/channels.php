<?php

use Illuminate\Support\Facades\Broadcast;

// Public channel for all admins
Broadcast::channel('admin-channel', function ($user) {
    return $user instanceof \App\Models\Admin;
});

// Private channel for specific user
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return $user instanceof \App\Models\User && (int) $user->user_id === (int) $userId;
});

// Private channel for specific admin
Broadcast::channel('admin.{adminId}', function ($user, $adminId) {
    return $user instanceof \App\Models\Admin && (int) $user->admin_id === (int) $adminId;
});