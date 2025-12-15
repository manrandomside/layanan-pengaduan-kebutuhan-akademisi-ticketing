<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationTokenMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $token;
    public string $type;

    /**
     * Create a new message instance.
     * 
     * @param string $userName - Nama user
     * @param string $token - Token verifikasi
     * @param string $type - Tipe verifikasi (email/phone)
     */
    public function __construct(string $userName, string $token, string $type)
    {
        $this->userName = $userName;
        $this->token = $token;
        $this->type = $type;
    }

    /**
     * Get the message envelope (subject email).
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Token Verifikasi - Ticketing System UPT Lab',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verification-token',
            with: [
                'userName' => $this->userName,
                'token' => $this->token,
                'type' => $this->type,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}