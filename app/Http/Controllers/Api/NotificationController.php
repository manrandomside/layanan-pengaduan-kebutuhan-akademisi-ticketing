<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get notifications for authenticated user
     */
    public function getUserNotifications(Request $request)
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->user_id)
            ->with(['complaint'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ], 200);
    }

    /**
     * Get notifications for authenticated admin
     */
    public function getAdminNotifications(Request $request)
    {
        $admin = $request->user();

        $notifications = Notification::where('admin_id', $admin->admin_id)
            ->with(['complaint'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ], 200);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->update([
            'is_read' => 'read',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'data' => $notification
        ], 200);
    }

    /**
     * Mark all notifications as read for user
     */
    public function markAllAsReadUser(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->user_id)
            ->where('is_read', 'unread')
            ->update(['is_read' => 'read']);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ], 200);
    }

    /**
     * Mark all notifications as read for admin
     */
    public function markAllAsReadAdmin(Request $request)
    {
        $admin = $request->user();

        Notification::where('admin_id', $admin->admin_id)
            ->where('is_read', 'unread')
            ->update(['is_read' => 'read']);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ], 200);
    }

    /**
     * Get unread notification count for user
     */
    public function getUnreadCountUser(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->user_id)
            ->where('is_read', 'unread')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count
            ]
        ], 200);
    }

    /**
     * Get unread notification count for admin
     */
    public function getUnreadCountAdmin(Request $request)
    {
        $admin = $request->user();

        $count = Notification::where('admin_id', $admin->admin_id)
            ->where('is_read', 'unread')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count
            ]
        ], 200);
    }
}