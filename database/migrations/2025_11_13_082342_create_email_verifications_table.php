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
        Schema::create('email_verifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('email', 255)->nullable();
            $table->string('no_telepon', 20)->nullable();
            $table->string('token', 255);
            $table->enum('type', ['email', 'phone']);
            $table->enum('is_verified', ['pending', 'verified'])->default('pending');
            $table->timestamp('created_at')->useCurrent();
            $table->dateTime('expires_at')->nullable();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_verifications');
    }
};