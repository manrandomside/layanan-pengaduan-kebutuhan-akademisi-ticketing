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

/**
 * Public routes - No authentication required
 */
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login/user', [AuthController::class, 'loginUser']);
    Route::post('/login/admin', [AuthController::class, 'loginAdmin']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    
    // Protected route - requires auth token to verify
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
});

/**
 * User protected routes - Requires user authentication
 */
Route::middleware(['auth:sanctum'])->prefix('user')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::prefix('tickets')->group(function () {
        Route::post('/claim', [TicketController::class, 'claimTickets']);
        Route::get('/balance', [TicketController::class, 'getTicketBalance']);
    });
    
    Route::prefix('complaints')->group(function () {
        Route::post('/', [ComplaintController::class, 'submitComplaint']);
        Route::get('/my-complaints', [ComplaintController::class, 'getMyComplaints']);
        Route::get('/search', [ComplaintController::class, 'searchComplaintHistory']);
        Route::get('/{id}', [ComplaintController::class, 'getComplaintDetail']);
    });
    
    Route::prefix('feedbacks')->group(function () {
        Route::post('/', [FeedbackController::class, 'submitFeedback']);
        Route::get('/my-feedbacks', [FeedbackController::class, 'getMyFeedbacks']);
        Route::get('/{id}', [FeedbackController::class, 'getFeedbackDetail']);
    });
    
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getUserNotifications']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCountUser']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsReadUser']);
    });
    
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getUserProfile']);
        Route::put('/', [ProfileController::class, 'updateUserProfile']);
        Route::put('/change-password', [ProfileController::class, 'changeUserPassword']);
        Route::post('/request-email-update', [ProfileController::class, 'requestEmailUpdate']);
        Route::post('/verify-email-update', [ProfileController::class, 'verifyEmailUpdate']);
        Route::post('/request-phone-update', [ProfileController::class, 'requestPhoneUpdate']);
        Route::post('/verify-phone-update', [ProfileController::class, 'verifyPhoneUpdate']);
    });
});

/**
 * Admin protected routes - Requires admin authentication
 */
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::prefix('complaints')->group(function () {
        Route::get('/', [ComplaintController::class, 'getAllComplaints']);
        Route::get('/{id}', [ComplaintController::class, 'getComplaintDetail']);
        Route::put('/{id}/status', [ComplaintController::class, 'updateComplaintStatus']);
    });
    
    Route::prefix('feedbacks')->group(function () {
        Route::get('/', [FeedbackController::class, 'getAllFeedbacks']);
        Route::get('/{id}', [FeedbackController::class, 'getFeedbackDetail']);
        Route::post('/{id}/reply', [FeedbackController::class, 'replyFeedback']);
    });
    
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getAdminNotifications']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCountAdmin']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsReadAdmin']);
    });
    
    Route::prefix('users')->group(function () {
        Route::get('/', [UserManagementController::class, 'getAllUsers']);
        Route::get('/{id}', [UserManagementController::class, 'getUserDetail']);
        Route::post('/', [UserManagementController::class, 'createUser']);
        Route::put('/{id}/deactivate', [UserManagementController::class, 'deactivateUser']);
        Route::put('/{id}/activate', [UserManagementController::class, 'activateUser']);
    });
    
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getAdminProfile']);
        Route::put('/', [ProfileController::class, 'updateAdminProfile']);
        Route::put('/change-password', [ProfileController::class, 'changeAdminPassword']);
    });
});