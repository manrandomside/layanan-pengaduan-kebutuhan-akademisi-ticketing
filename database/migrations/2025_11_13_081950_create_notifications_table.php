<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->enum('type', ['complaint_submitted', 'status_changed', 'feedback_replied']);
            $table->string('title', 255);
            $table->text('message');
            $table->unsignedBigInteger('related_complaint_id')->nullable();
            $table->enum('is_read', ['unread', 'read'])->default('unread');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('admin_id')->on('admins')->onDelete('cascade');
            $table->foreign('related_complaint_id')->references('complaint_id')->on('complaints')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('admin_id');
            $table->index('is_read');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};