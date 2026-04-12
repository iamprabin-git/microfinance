<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        $users = User::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ]);

        return Inertia::render('Dashboard', [
            'companyUsers' => $users,
        ]);
    }
}
