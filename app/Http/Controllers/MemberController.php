<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\ProductType;
use App\Models\Member;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
                'savings_account_number' => $m->savings_account_number,
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
        $redirectTo = $request->query('redirect_to');
        $redirectTo = is_string($redirectTo) ? trim($redirectTo) : null;

        return Inertia::render('Members/Create', [
            'redirect_to' => $this->isSafeRedirectPath($redirectTo) ? $redirectTo : null,
        ]);
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
            'redirect_to' => ['nullable', 'string', 'max:2048'],
        ]);

        $payload = collect($validated)->except('profile_image')->all();
        $payload['company_id'] = $companyId;
        if ($request->hasFile('profile_image')) {
            $payload['profile_photo_path'] = $request->file('profile_image')->store('member-photos', 'public');
        }

        $redirectTo = isset($validated['redirect_to']) && is_string($validated['redirect_to'])
            ? trim($validated['redirect_to'])
            : null;

        $member = Member::query()->create($payload);

        if ($this->isSafeRedirectPath($redirectTo)) {
            $target = $this->appendQueryParam((string) $redirectTo, 'member_id', (string) $member->id);

            return redirect($target)->with('status', 'Member created.');
        }

        return redirect()->route('members.index')->with('status', 'Member created.');
    }

    public function edit(Request $request, Member $member): Response
    {
        return Inertia::render('Members/Edit', [
            'member' => [
                'id' => $member->id,
                'member_number' => $member->member_number,
                'savings_account_number' => $member->savings_account_number,
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
            'savings_account_number' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('members', 'savings_account_number')
                    ->where(fn ($q) => $q->where('company_id', $member->company_id))
                    ->ignore($member->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string', 'max:2000'],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $payload = collect($validated)->except('profile_image')->all();
        if (array_key_exists('savings_account_number', $payload) && ! filled($payload['savings_account_number'])) {
            $payload['savings_account_number'] = null;
        }
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

    public function issueSavingsAccount(Request $request, Member $member): RedirectResponse
    {
        $this->authorize('update', $member);

        $companyId = (int) $request->user()->company_id;
        abort_unless((int) $member->company_id === $companyId, 404);
        $redirectToRaw = $request->input('redirect_to', $request->query('redirect_to'));
        $redirectTo = is_string($redirectToRaw) ? trim($redirectToRaw) : null;
        $productCodeRaw = $request->input('product_code');
        $productCode = is_string($productCodeRaw) ? trim($productCodeRaw) : '';

        if (filled($member->savings_account_number)) {
            if ($this->isSafeRedirectPath($redirectTo)) {
                return redirect($this->appendQueryParam((string) $redirectTo, 'member_id', (string) $member->id))
                    ->with('status', 'This member already has a savings account.');
            }

            return redirect()
                ->route('members.edit', $member)
                ->with('status', 'This member already has a savings account.');
        }

        if ($member->member_number === null) {
            if ($this->isSafeRedirectPath($redirectTo)) {
                return redirect($this->appendQueryParam((string) $redirectTo, 'member_id', (string) $member->id))
                    ->with('status', 'Member must be registered (serial number assigned) before opening a savings account.');
            }

            return redirect()
                ->route('members.edit', $member)
                ->with('status', 'Member must be registered (serial number assigned) before opening a savings account.');
        }

        $prefix = 'SAV';
        if ($productCode !== '') {
            $product = Product::query()
                ->forCompany($companyId)
                ->where('type', ProductType::Savings->value)
                ->where('code', strtoupper($productCode))
                ->first();

            if ($product !== null) {
                $prefix = strtoupper(trim((string) $product->code));
            }
        }

        $code = null;
        for ($i = 0; $i < 5; $i++) {
            $code = $this->nextAccountNumber($companyId, 'savings_account_number', $prefix.'-', 6);
            $exists = Member::query()
                ->forCompany($companyId)
                ->where('savings_account_number', $code)
                ->exists();
            if (! $exists) {
                break;
            }
            $code = null;
        }

        if ($code === null) {
            throw ValidationException::withMessages([
                'savings_account_number' => 'Could not allocate a unique savings account number. Try again.',
            ]);
        }

        $member->forceFill(['savings_account_number' => $code])->save();

        if ($this->isSafeRedirectPath($redirectTo)) {
            return redirect($this->appendQueryParam((string) $redirectTo, 'member_id', (string) $member->id))
                ->with('status', 'Savings account opened: '.$code.'.');
        }

        return redirect()
            ->route('members.edit', $member)
            ->with('status', 'Savings account opened: '.$code.'.');
    }

    private function nextAccountNumber(
        int $companyId,
        string $column,
        string $prefix,
        int $pad,
    ): string {
        $values = Member::query()
            ->forCompany($companyId)
            ->whereNotNull($column)
            ->where($column, 'like', $prefix.'%')
            ->pluck($column)
            ->all();

        $max = 0;
        foreach ($values as $val) {
            $suffix = substr((string) $val, strlen($prefix));
            if ($suffix === false || $suffix === '') {
                continue;
            }
            if (! ctype_digit($suffix)) {
                continue;
            }
            $n = (int) $suffix;
            $max = max($max, $n);
        }

        return $prefix.str_pad((string) ($max + 1), $pad, '0', STR_PAD_LEFT);
    }

    private function isSafeRedirectPath(?string $path): bool
    {
        if (! filled($path)) {
            return false;
        }
        $path = trim((string) $path);
        if (! str_starts_with($path, '/')) {
            return false;
        }
        if (str_starts_with($path, '//')) {
            return false;
        }
        if (preg_match('/\r|\n/', $path) === 1) {
            return false;
        }

        return true;
    }

    private function appendQueryParam(string $path, string $key, string $value): string
    {
        $parts = parse_url($path);
        if ($parts === false) {
            return $path;
        }

        $query = [];
        if (isset($parts['query'])) {
            parse_str((string) $parts['query'], $query);
        }
        $query[$key] = $value;
        $queryString = http_build_query($query);

        $result = ($parts['path'] ?? $path).($queryString !== '' ? '?'.$queryString : '');
        if (isset($parts['fragment']) && $parts['fragment'] !== '') {
            $result .= '#'.$parts['fragment'];
        }

        return $result;
    }
}
