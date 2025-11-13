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
        Schema::create('complaint_status_history', function (Blueprint $table) {
            $table->id('history_id');
            $table->unsignedBigInteger('complaint_id');
            $table->enum('status_lama', ['waiting', 'on_progress', 'done'])->nullable();
            $table->enum('status_baru', ['waiting', 'on_progress', 'done']);
            $table->unsignedBigInteger('changed_by_admin')->nullable();
            $table->timestamp('changed_at')->useCurrent();
            
            $table->foreign('complaint_id')->references('complaint_id')->on('complaints')->onDelete('cascade');
            $table->foreign('changed_by_admin')->references('admin_id')->on('admins')->onDelete('set null');
            
            $table->index('complaint_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_status_history');
    }
};