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
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('nama_lengkap', 255);
            $table->string('nim_nip', 50)->unique();
            $table->string('email', 255)->unique();
            $table->string('no_telepon', 20);
            $table->enum('status', ['dosen', 'asdos', 'staff', 'mahasiswa']);
            $table->string('password', 255);
            $table->integer('total_tickets')->default(0);
            $table->integer('daily_tickets')->default(0);
            $table->date('last_ticket_reset')->nullable();
            $table->enum('is_active', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            $table->index('email');
            $table->index('no_telepon');
            $table->index('nim_nip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};