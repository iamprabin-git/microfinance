<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyWebUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === UserRole::SuperAdmin) {
            return redirect('/admin');
        }

        if (! $user?->company_id) {
            abort(403, 'This area is only for company users.');
        }

        $user->loadMissing('company');

        if ($user->company && ! $user->company->is_active) {
            abort(403, 'Your organization is inactive. Contact support after payment is verified.');
        }

        return $next($request);
    }
}
