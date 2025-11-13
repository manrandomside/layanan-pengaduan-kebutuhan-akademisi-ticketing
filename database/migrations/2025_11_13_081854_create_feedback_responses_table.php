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
        Schema::create('feedback_responses', function (Blueprint $table) {
            $table->id('response_id');
            $table->unsignedBigInteger('feedback_id');
            $table->unsignedBigInteger('admin_id');
            $table->text('response_text');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('feedback_id')->references('feedback_id')->on('feedbacks')->onDelete('cascade');
            $table->foreign('admin_id')->references('admin_id')->on('admins')->onDelete('cascade');
            
            $table->index('feedback_id');
            $table->index('admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_responses');
    }
};