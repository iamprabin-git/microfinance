<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        $groups = Group::query()
            ->where('company_id', $companyId)
            ->withCount('members')
            ->orderBy('name')
            ->get();

        return Inertia::render('Groups/Index', [
            'groups' => $groups->map(fn (Group $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'monthly_contribution_amount' => (string) $group->monthly_contribution_amount,
                'currency' => $group->currency,
                'members_count' => $group->members_count,
            ]),
        ]);
    }
}
