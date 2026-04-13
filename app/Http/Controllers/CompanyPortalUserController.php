<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class CompanyPortalUserController extends Controller
{
    public function create(Request $request): Response
    {
        abort_unless($request->user()?->isCompanyAdmin(), 403);

        return Inertia::render('CompanyUsers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->isCompanyAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => UserRole::CompanyStaff,
            'company_id' => $request->user()->company_id,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('status', 'Staff user created.');
    }
}
