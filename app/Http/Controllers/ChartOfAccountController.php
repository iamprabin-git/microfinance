<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChartOfAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureCanView($request);

        $companyId = (int) $request->user()->company_id;

        $accounts = ChartOfAccount::query()
            ->forCompany($companyId)
            ->withCount('users')
            ->orderBy('code')
            ->orderBy('name')
            ->get()
            ->map(fn (ChartOfAccount $account) => [
                'id' => $account->id,
                'type' => $account->type->value,
                'code' => $account->code,
                'name' => $account->name,
                'description' => $account->description,
                'is_active' => (bool) $account->is_active,
                'assigned_users_count' => (int) $account->users_count,
            ]);

        return Inertia::render('ChartOfAccounts/Index', [
            'accounts' => $accounts,
            'can_manage' => (bool) $request->user()?->isCompanyAdmin(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureCanManage($request);

        return Inertia::render('ChartOfAccounts/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureCanManage($request);

        $companyId = (int) $request->user()->company_id;
        $validated = $this->validateAccount($request, $companyId);
        $validated['company_id'] = $companyId;

        ChartOfAccount::query()->create($validated);

        return redirect()
            ->route('chart-of-accounts.index')
            ->with('status', 'Chart of account created.');
    }

    public function edit(Request $request, ChartOfAccount $chartOfAccount): Response
    {
        $this->ensureAccountAccess($request, $chartOfAccount);

        return Inertia::render('ChartOfAccounts/Edit', [
            'account' => [
                'id' => $chartOfAccount->id,
                'type' => $chartOfAccount->type->value,
                'code' => $chartOfAccount->code,
                'name' => $chartOfAccount->name,
                'description' => $chartOfAccount->description,
                'is_active' => (bool) $chartOfAccount->is_active,
            ],
        ]);
    }

    public function update(Request $request, ChartOfAccount $chartOfAccount): RedirectResponse
    {
        $this->ensureAccountAccess($request, $chartOfAccount);

        $companyId = (int) $request->user()->company_id;
        $chartOfAccount->update($this->validateAccount($request, $companyId, $chartOfAccount));

        return redirect()
            ->route('chart-of-accounts.index')
            ->with('status', 'Chart of account updated.');
    }

    public function destroy(Request $request, ChartOfAccount $chartOfAccount): RedirectResponse
    {
        $this->ensureAccountAccess($request, $chartOfAccount);

        $chartOfAccount->delete();

        return redirect()
            ->route('chart-of-accounts.index')
            ->with('status', 'Chart of account removed.');
    }

    /**
     * @return array{code: string, name: string, description: string|null, is_active: bool}
     */
    private function validateAccount(
        Request $request,
        int $companyId,
        ?ChartOfAccount $account = null,
    ): array {
        return $request->validate([
            'type' => [
                'required',
                'string',
                Rule::in(array_map(fn($enum) => $enum->value, \App\Enums\ChartOfAccountType::cases())),
            ],
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('chart_of_accounts', 'code')
                    ->where(fn ($query) => $query->where('company_id', $companyId))
                    ->ignore($account?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
        ]);
    }

    private function ensureCanManage(Request $request): void
    {
        abort_unless($request->user()?->isCompanyAdmin(), 403);
    }

    private function ensureCanView(Request $request): void
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);
    }

    private function ensureAccountAccess(Request $request, ChartOfAccount $chartOfAccount): void
    {
        $this->ensureCanManage($request);

        abort_unless(
            (int) $chartOfAccount->company_id === (int) $request->user()?->company_id,
            404,
        );
    }
}
