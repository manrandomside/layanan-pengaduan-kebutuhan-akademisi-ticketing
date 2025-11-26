<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public channel for all admins
Broadcast::channel('admin-channel', function ($user) {
    return $user instanceof \App\Models\Admin;
});

// Private channel for specific user
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->user_id === (int) $userId;
});

// Private channel for specific admin
Broadcast::channel('admin.{adminId}', function ($user, $adminId) {
    return (int) $user->admin_id === (int) $adminId;
});