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
        Schema::create('complaints', function (Blueprint $table) {
            $table->id('complaint_id');
            $table->string('ticket_id', 20);
            $table->unsignedBigInteger('user_id');
            $table->string('nama_lengkap', 255);
            $table->string('nim_nip', 50);
            $table->string('email', 255);
            $table->string('no_telepon', 20);
            $table->enum('status_user', ['dosen', 'asdos', 'staff', 'mahasiswa']);
            $table->string('kelas', 100)->nullable();
            $table->string('lab', 100)->nullable();
            $table->string('ruangan', 100)->nullable();
            $table->text('keluhan');
            $table->enum('priority', ['low', 'middle', 'high']);
            $table->enum('status', ['waiting', 'on_progress', 'done'])->default('waiting');
            $table->timestamps();
            
            $table->foreign('ticket_id')->references('ticket_id')->on('tickets')->onDelete('restrict');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('status');
            $table->index('priority');
            $table->index('created_at');
            $table->fullText(['keluhan', 'kelas', 'lab', 'ruangan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};