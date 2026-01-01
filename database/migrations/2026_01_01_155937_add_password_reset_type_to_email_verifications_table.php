<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add 'password_reset' type to email_verifications table enum
     */
    public function up(): void
    {
        // Modify enum type to include 'password_reset'
        DB::statement("ALTER TABLE email_verifications MODIFY COLUMN type ENUM('email', 'phone', 'password_reset') NOT NULL");
        
        // Make user_id nullable for password reset (user not logged in)
        Schema::table('email_verifications', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove password_reset records first
        DB::table('email_verifications')->where('type', 'password_reset')->delete();
        
        // Revert enum type
        DB::statement("ALTER TABLE email_verifications MODIFY COLUMN type ENUM('email', 'phone') NOT NULL");
        
        // Revert user_id to not nullable
        Schema::table('email_verifications', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};