<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetTokenMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $token;

    public function __construct(string $userName, string $token)
    {
        $this->userName = $userName;
        $this->token = $token;
    }

    // Email subject
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Password - Citra Konsultama Ticketing System',
        );
    }

    // Email content view
    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset-token',
            with: [
                'userName' => $this->userName,
                'token' => $this->token,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}