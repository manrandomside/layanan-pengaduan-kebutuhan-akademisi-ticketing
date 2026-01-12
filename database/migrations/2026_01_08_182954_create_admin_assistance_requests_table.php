<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Migration untuk tabel admin_assistance_requests
     * Menyimpan request bantuan user ke admin (reset password, ganti email, ganti phone)
     */
    public function up(): void
    {
        Schema::create('admin_assistance_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('type', ['password_reset', 'email_change', 'phone_change']);
            $table->string('email_registered', 255);
            $table->string('nama_lengkap', 255);
            $table->string('nim_nip', 50);
            $table->string('new_value', 255)->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected'])->default('pending');
            $table->unsignedBigInteger('processed_by_admin')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('processed_by_admin')->references('admin_id')->on('admins')->onDelete('set null');

            // Indexes
            $table->index('user_id');
            $table->index('type');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_assistance_requests');
    }
};