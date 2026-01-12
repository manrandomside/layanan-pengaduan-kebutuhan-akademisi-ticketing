<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdminAssistanceController;

/**
 * Public routes - No authentication required
 */
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login/user', [AuthController::class, 'loginUser']);
    Route::post('/login/admin', [AuthController::class, 'loginAdmin']);
    
    // Forgot Password (via token email)
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/forgot-password/verify-token', [AuthController::class, 'verifyResetToken']);
    Route::post('/forgot-password/reset-password', [AuthController::class, 'resetPassword']);
    
    // Forgot Password (via admin assistance)
    Route::post('/forgot-password/request-admin', [AuthController::class, 'forgotPasswordRequestAdmin']);
    
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
});

/**
 * User protected routes
 */
Route::middleware(['auth:sanctum'])->prefix('user')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Tickets
    Route::prefix('tickets')->group(function () {
        Route::post('/claim', [TicketController::class, 'claimTickets']);
        Route::get('/balance', [TicketController::class, 'getTicketBalance']);
    });
    
    // Complaints
    Route::prefix('complaints')->group(function () {
        Route::post('/', [ComplaintController::class, 'submitComplaint']);
        Route::get('/my-complaints', [ComplaintController::class, 'getMyComplaints']);
        Route::get('/search', [ComplaintController::class, 'searchComplaintHistory']);
        Route::get('/{id}', [ComplaintController::class, 'getComplaintDetail'])->where('id', '[0-9]+');
    });
    
    // Feedbacks
    Route::prefix('feedbacks')->group(function () {
        Route::post('/', [FeedbackController::class, 'submitFeedback']);
        Route::get('/my-feedbacks', [FeedbackController::class, 'getMyFeedbacks']);
        Route::get('/{id}', [FeedbackController::class, 'getFeedbackDetail'])->where('id', '[0-9]+');
    });
    
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getUserNotifications']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCountUser']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsReadUser']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead'])->where('id', '[0-9]+');
    });
    
    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getUserProfile']);
        Route::put('/', [ProfileController::class, 'updateUserProfile']);
        Route::put('/change-password', [ProfileController::class, 'changeUserPassword']);
        
        // Email update (via token)
        Route::post('/request-email-update', [ProfileController::class, 'requestEmailUpdate']);
        Route::post('/verify-email-update', [ProfileController::class, 'verifyEmailUpdate']);
        
        // Phone update (via token)
        Route::post('/request-phone-update', [ProfileController::class, 'requestPhoneUpdate']);
        Route::post('/verify-phone-update', [ProfileController::class, 'verifyPhoneUpdate']);
        
        // Email & Phone update (via admin assistance)
        Route::post('/request-email-change-admin', [ProfileController::class, 'requestEmailChangeAdmin']);
        Route::post('/request-phone-change-admin', [ProfileController::class, 'requestPhoneChangeAdmin']);
    });
    
    Route::get('/assistance-requests', [ProfileController::class, 'getUserAssistanceRequests']);
});

/**
 * Admin protected routes
 */
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Complaints
    Route::prefix('complaints')->group(function () {
        Route::get('/', [ComplaintController::class, 'getAllComplaints']);
        Route::get('/{id}', [ComplaintController::class, 'getComplaintDetail'])->where('id', '[0-9]+');
        Route::put('/{id}/status', [ComplaintController::class, 'updateComplaintStatus'])->where('id', '[0-9]+');
        Route::put('/{id}/hide', [ComplaintController::class, 'toggleHideComplaint'])->where('id', '[0-9]+');
    });
    
    // Feedbacks
    Route::prefix('feedbacks')->group(function () {
        Route::get('/', [FeedbackController::class, 'getAllFeedbacks']);
        Route::get('/{id}', [FeedbackController::class, 'getFeedbackDetail'])->where('id', '[0-9]+');
        Route::post('/{id}/reply', [FeedbackController::class, 'replyFeedback'])->where('id', '[0-9]+');
    });
    
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getAdminNotifications']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCountAdmin']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsReadAdmin']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead'])->where('id', '[0-9]+');
    });
    
    // Users Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserManagementController::class, 'getAllUsers']);
        Route::post('/', [UserManagementController::class, 'createUser']);
        Route::get('/{id}', [UserManagementController::class, 'getUserDetail'])->where('id', '[0-9]+');
        Route::put('/{id}/deactivate', [UserManagementController::class, 'deactivateUser'])->where('id', '[0-9]+');
        Route::put('/{id}/activate', [UserManagementController::class, 'activateUser'])->where('id', '[0-9]+');
    });
    
    // Admin Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getAdminProfile']);
        Route::put('/', [ProfileController::class, 'updateAdminProfile']);
        Route::put('/change-password', [ProfileController::class, 'changeAdminPassword']);
    });
    
    // Admin Assistance - Kelola request bantuan user
    Route::prefix('assistance-requests')->group(function () {
        Route::get('/', [AdminAssistanceController::class, 'index']);
        Route::get('/statistics', [AdminAssistanceController::class, 'statistics']);
        Route::put('/{id}/process', [AdminAssistanceController::class, 'process'])->where('id', '[0-9]+');
        Route::put('/{id}/reset-password', [AdminAssistanceController::class, 'resetPassword'])->where('id', '[0-9]+');
        Route::put('/{id}/approve', [AdminAssistanceController::class, 'approve'])->where('id', '[0-9]+');
        Route::put('/{id}/reject', [AdminAssistanceController::class, 'reject'])->where('id', '[0-9]+');
        Route::put('/{id}/complete', [AdminAssistanceController::class, 'complete'])->where('id', '[0-9]+');
        Route::get('/{id}', [AdminAssistanceController::class, 'show'])->where('id', '[0-9]+');
    });
});