<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #371f4a 0%, #5a3d6e 100%); padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                Citra Konsultama - Ticketing System
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                                Sistem Layanan Pengaduan Kebutuhan Akademisi
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Greeting -->
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Halo <strong>{{ $userName }}</strong>,
                            </p>
                            
                            <!-- Request Info -->
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Anda telah meminta untuk <strong>reset password</strong> akun Citra Konsultama - Ticketing System Anda. Gunakan token berikut untuk melanjutkan proses reset password.
                            </p>
                            
                            <!-- Token Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #371f4a 0%, #5a3d6e 100%); border-radius: 12px; padding: 25px 40px; display: inline-block;">
                                            <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.8); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                                Token Reset Password
                                            </p>
                                            <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                {{ $token }}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                                <tr>
                                    <td style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 8px 8px 0; padding: 20px;">
                                        <p style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 600;">
                                            Cara Menggunakan Token:
                                        </p>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 6px 0; vertical-align: top; width: 25px;">
                                                    <span style="display: inline-block; width: 20px; height: 20px; background-color: #22c55e; color: #ffffff; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; font-weight: bold;">1</span>
                                                </td>
                                                <td style="padding: 6px 0; color: #333333; font-size: 14px;">
                                                    <strong>Salin</strong> kode token 6 digit di atas
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; vertical-align: top; width: 25px;">
                                                    <span style="display: inline-block; width: 20px; height: 20px; background-color: #22c55e; color: #ffffff; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; font-weight: bold;">2</span>
                                                </td>
                                                <td style="padding: 6px 0; color: #333333; font-size: 14px;">
                                                    Kembali ke halaman <strong>Lupa Password</strong> di aplikasi
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; vertical-align: top; width: 25px;">
                                                    <span style="display: inline-block; width: 20px; height: 20px; background-color: #22c55e; color: #ffffff; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; font-weight: bold;">3</span>
                                                </td>
                                                <td style="padding: 6px 0; color: #333333; font-size: 14px;">
                                                    <strong>Paste</strong> token pada kolom verifikasi
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; vertical-align: top; width: 25px;">
                                                    <span style="display: inline-block; width: 20px; height: 20px; background-color: #22c55e; color: #ffffff; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; font-weight: bold;">4</span>
                                                </td>
                                                <td style="padding: 6px 0; color: #333333; font-size: 14px;">
                                                    Buat <strong>password baru</strong> untuk akun Anda
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Expiry Warning -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 15px 20px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                                            <strong>Perhatian:</strong> Token ini hanya berlaku selama <strong>24 jam</strong> sejak email ini dikirim. Setelah itu, Anda perlu meminta token baru.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                            
                            <!-- Security Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 15px 20px;">
                                        <p style="margin: 0; color: #991b1b; font-size: 13px;">
                                            <strong>Keamanan:</strong> Jika Anda tidak merasa melakukan permintaan reset password ini, abaikan email ini. Jangan bagikan token ini kepada siapapun. Akun Anda tetap aman.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #371f4a 0%, #5a3d6e 100%); padding: 25px 40px; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #ffffff; font-size: 14px; text-align: center;">
                                Terima kasih telah menggunakan layanan kami
                            </p>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px; text-align: center;">
                                <strong>Tim Ticketing System Citra Konsultama Indonesia</strong>
                            </p>
                            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 20px 0;">
                            <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-align: center;">
                                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.<br>
                                &copy; 2025 PT Citra Konsultama Indonesia. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>