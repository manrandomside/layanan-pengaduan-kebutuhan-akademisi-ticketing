<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk mengizinkan request dari frontend ke backend API
    | ketika berada di domain yang berbeda.
    |
    */

    // Path yang diizinkan untuk CORS
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    // HTTP methods yang diizinkan
    'allowed_methods' => ['*'],

    // Domain yang diizinkan (diambil dari .env FRONTEND_URL)
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    // Headers yang diizinkan
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Penting untuk Sanctum authentication dengan cookies
    'supports_credentials' => true,

];