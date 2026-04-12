<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Member::class, 'member');
    }

    public function index(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        $members = Member::query()
            ->forCompany($companyId)
            ->with('group:id,name,currency')
            ->orderBy('name')
            ->get()
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'group' => [
                    'id' => $m->group->id,
                    'name' => $m->group->name,
                    'currency' => $m->group->currency,
                ],
            ]);

        return Inertia::render('Members/Index', [
            'members' => $members,
        ]);
    }

    public function create(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        return Inertia::render('Members/Create', [
            'groups' => $this->groupOptions($companyId),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'group_id' => [
                'required',
                'integer',
                Rule::exists('groups', 'id')->where('company_id', $companyId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
        ]);

        Member::query()->create($validated);

        return redirect()->route('members.index')->with('status', 'Member created.');
    }

    public function edit(Request $request, Member $member): Response
    {
        $companyId = (int) $request->user()->company_id;

        return Inertia::render('Members/Edit', [
            'member' => [
                'id' => $member->id,
                'group_id' => $member->group_id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
            ],
            'groups' => $this->groupOptions($companyId),
        ]);
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'group_id' => [
                'required',
                'integer',
                Rule::exists('groups', 'id')->where('company_id', $companyId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
        ]);

        $member->update($validated);

        return redirect()->route('members.index')->with('status', 'Member updated.');
    }

    public function destroy(Member $member): RedirectResponse
    {
        $member->delete();

        return redirect()->route('members.index')->with('status', 'Member removed.');
    }

    /**
     * @return list<array{id: int, name: string, currency: string}>
     */
    private function groupOptions(int $companyId): array
    {
        return Group::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get()
            ->map(fn (Group $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'currency' => $g->currency,
            ])
            ->all();
    }
}
