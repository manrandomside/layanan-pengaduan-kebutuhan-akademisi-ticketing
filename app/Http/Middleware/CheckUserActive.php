<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && method_exists($user, 'getAttribute')) {
            $isActive = $user->getAttribute('is_active');
            
            if ($isActive === 'inactive') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated by admin. Please contact support.'
                ], 403);
            }
        }

        return $next($request);
    }
}