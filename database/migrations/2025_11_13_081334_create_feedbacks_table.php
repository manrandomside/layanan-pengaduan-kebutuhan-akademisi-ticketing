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
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id('feedback_id');
            $table->unsignedBigInteger('complaint_id')->unique();
            $table->unsignedBigInteger('user_id');
            $table->tinyInteger('rating')->unsigned();
            $table->text('feedback_text')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('complaint_id')->references('complaint_id')->on('complaints')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('complaint_id');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};