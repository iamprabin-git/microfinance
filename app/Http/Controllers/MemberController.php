<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
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

        $query = Member::query()->forCompany($companyId);
        if ($request->user()->isCompanyEndUser()) {
            $email = strtolower(trim($request->user()->email));
            $query->whereNotNull('email')
                ->whereRaw('LOWER(TRIM(email)) = ?', [$email]);
        }

        $members = $query
            ->orderBy('name')
            ->get()
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'member_number' => $m->member_number,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'address' => $m->address,
                'profile_photo_url' => $m->profilePhotoPublicUrl(),
            ]);

        return Inertia::render('Members/Index', [
            'members' => $members,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Members/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string', 'max:2000'],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $payload = collect($validated)->except('profile_image')->all();
        $payload['company_id'] = $companyId;
        if ($request->hasFile('profile_image')) {
            $payload['profile_photo_path'] = $request->file('profile_image')->store('member-photos', 'public');
        }

        Member::query()->create($payload);

        return redirect()->route('members.index')->with('status', 'Member created.');
    }

    public function edit(Request $request, Member $member): Response
    {
        return Inertia::render('Members/Edit', [
            'member' => [
                'id' => $member->id,
                'member_number' => $member->member_number,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'address' => $member->address,
                'profile_photo_url' => $member->profilePhotoPublicUrl(),
            ],
        ]);
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string', 'max:2000'],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $payload = collect($validated)->except('profile_image')->all();
        if ($request->hasFile('profile_image')) {
            if ($member->profile_photo_path) {
                Storage::disk('public')->delete($member->profile_photo_path);
            }
            $payload['profile_photo_path'] = $request->file('profile_image')->store('member-photos', 'public');
        }

        $member->update($payload);

        return redirect()->route('members.index')->with('status', 'Member updated.');
    }

    public function destroy(Member $member): RedirectResponse
    {
        if ($member->profile_photo_path) {
            Storage::disk('public')->delete($member->profile_photo_path);
        }

        $member->delete();

        return redirect()->route('members.index')->with('status', 'Member removed.');
    }

    public function createEndUser(Request $request, Member $member): Response
    {
        $this->authorize('inviteEndUser', $member);

        return Inertia::render('Members/InviteEndUser', [
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
            ],
        ]);
    }

    public function storeEndUser(Request $request, Member $member): RedirectResponse
    {
        $this->authorize('inviteEndUser', $member);

        $email = strtolower(trim((string) $member->email));

        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (User::query()->whereRaw('LOWER(TRIM(email)) = ?', [$email])->exists()) {
            throw ValidationException::withMessages([
                'email' => 'A user account already exists for this email.',
            ]);
        }

        User::query()->create([
            'name' => $member->name,
            'email' => $email,
            'password' => $request->input('password'),
            'role' => UserRole::CompanyEndUser,
            'company_id' => $member->company_id,
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('members.index')
            ->with('status', 'End user account created for '.$member->name.'.');
    }
}
