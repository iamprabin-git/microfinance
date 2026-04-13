<?php

namespace App\Http\Middleware;

use Filament\Facades\Filament;
use Filament\Http\Middleware\Authenticate as BaseAuthenticate;
use Filament\Models\Contracts\FilamentUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Filament's default Authenticate middleware aborts 403 when the session user cannot
 * access the panel. Company portal users share the web guard, so send them to the
 * dashboard instead of a bare 403 (middleware priority would run Filament auth
 * before any separate "redirect first" middleware).
 */
class FilamentAuthenticate extends BaseAuthenticate
{
    /**
     * @param  array<string>  $guards
     */
    protected function authenticate($request, array $guards): void
    {
        $guard = Filament::auth();

        if (! $guard->check()) {
            $this->unauthenticated($request, $guards);

            return;
        }

        $this->auth->shouldUse(Filament::getAuthGuard());

        /** @var Model $user */
        $user = $guard->user();

        $panel = Filament::getCurrentPanel();

        if ($user instanceof FilamentUser && ! $user->canAccessPanel($panel)) {
            throw new HttpResponseException(
                redirect()
                    ->route('dashboard')
                    ->with(
                        'status',
                        'The admin console is only for platform administrators. You are in the company portal below.',
                    ),
            );
        }

        abort_if(
            ! $user instanceof FilamentUser && config('app.env') !== 'local',
            403,
        );
    }
}
