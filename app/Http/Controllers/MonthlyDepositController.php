<?php

namespace App\Http\Controllers;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Enums\ProductType;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MonthlyDepositController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(MonthlyDeposit::class, 'saving');
    }

    public function index(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        $savings = $this->savingsQueryForUser($request, $companyId)
            ->with([
                'company:id,currency',
                'member:id,name,member_number,savings_account_number',
            ])
            ->orderByDesc('period')
            ->orderBy('member_id')
            ->get()
            ->map(fn (MonthlyDeposit $row) => [
                'id' => $row->id,
                'period' => $row->period->format('Y-m-d'),
                'amount' => (string) $row->amount,
                'status' => $row->status->value,
                'company_approval_status' => $row->company_approval_status->value,
                'paid_at' => $row->paid_at?->format('Y-m-d'),
                'currency' => $row->company?->currency ?? config('app.default_currency'),
                'member' => [
                    'id' => $row->member->id,
                    'name' => $row->member->name,
                    'member_number' => $row->member->member_number,
                    'savings_account_number' => $row->member->savings_account_number,
                ],
            ]);

        $monthStart = Carbon::today()->startOfMonth()->toDateString();
        $membersMissingSavings = $this->membersMissingSavingForMonth(
            $request,
            $companyId,
            $monthStart,
        );

        return Inertia::render('Savings/Index', [
            'savings' => $savings,
            'missing_savings_period_label' => Carbon::today()->format('Y-m'),
            'members_missing_savings' => $membersMissingSavings,
        ]);
    }

    public function create(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;
        $company = $request->user()->company;

        $defaultMemberId = null;
        $rawMemberId = $request->query('member_id');
        if ($rawMemberId !== null && $rawMemberId !== '') {
            $mid = (int) $rawMemberId;
            if ($mid > 0 && Member::query()->forCompany($companyId)->where('id', $mid)->exists()) {
                $defaultMemberId = $mid;
            }
        }

        $members = $this->membersForSavingsForms($companyId);
        $membersPendingSavingsAccount = $this->membersPendingSavingsAccount($companyId);
        $blockedReason = $members === []
            ? 'No member is ready for monthly savings yet. Open a savings account for at least one registered member first.'
            : null;

        return Inertia::render('Savings/Create', [
            'members' => $members,
            'members_pending_savings_account' => $membersPendingSavingsAccount,
            'saving_products' => $this->savingProductsForCompany($companyId),
            'currency' => $company?->currency ?? config('app.default_currency'),
            'default_member_id' => $defaultMemberId,
            'blockedReason' => $blockedReason,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'member_id' => ['required', 'integer'],
            'period' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', Rule::enum(DepositStatus::class)],
            'paid_at' => ['nullable', 'date', 'required_if:status,'.DepositStatus::Paid->value],
        ]);

        $member = Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);
        $this->ensureMemberEligibleForSavingRecords($member);

        $periodStart = Carbon::parse($validated['period'])->startOfMonth()->toDateString();

        $dup = MonthlyDeposit::query()
            ->where('member_id', $validated['member_id'])
            ->where('period', $periodStart)
            ->exists();
        if ($dup) {
            throw ValidationException::withMessages([
                'period' => 'This member already has a saving entry for that month.',
            ]);
        }

        MonthlyDeposit::query()->create([
            'company_id' => $companyId,
            'member_id' => $validated['member_id'],
            'period' => $periodStart,
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'paid_at' => $validated['status'] === DepositStatus::Paid
                ? ($validated['paid_at'] ?? now()->toDateString())
                : null,
            'company_approval_status' => $request->user()->isCompanyAdmin()
                ? CompanyApprovalStatus::Approved
                : CompanyApprovalStatus::PendingApproval,
        ]);

        return redirect()->route('savings.index')->with('status', 'Saving record created.');
    }

    public function edit(Request $request, MonthlyDeposit $saving): Response
    {
        $companyId = (int) $request->user()->company_id;

        $saving->load('company:id,currency');

        return Inertia::render('Savings/Edit', [
            'saving' => [
                'id' => $saving->id,
                'member_id' => $saving->member_id,
                'period' => $saving->period->format('Y-m-d'),
                'amount' => (string) $saving->amount,
                'status' => $saving->status->value,
                'paid_at' => $saving->paid_at?->format('Y-m-d'),
                'company_approval_status' => $saving->company_approval_status->value,
                'currency' => $saving->company?->currency ?? config('app.default_currency'),
            ],
            'members' => $this->membersForSavingsForms($companyId, (int) $saving->member_id),
            'canApproveRecords' => $request->user()->canApproveCompanyPortalRecords(),
        ]);
    }

    public function update(Request $request, MonthlyDeposit $saving): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'member_id' => ['required', 'integer'],
            'period' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', Rule::enum(DepositStatus::class)],
            'paid_at' => ['nullable', 'date', 'required_if:status,'.DepositStatus::Paid->value],
        ]);

        $member = Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);
        $this->ensureMemberEligibleForSavingRecords($member);

        $periodStart = Carbon::parse($validated['period'])->startOfMonth()->toDateString();

        $dup = MonthlyDeposit::query()
            ->where('member_id', $validated['member_id'])
            ->where('period', $periodStart)
            ->where('id', '!=', $saving->id)
            ->exists();
        if ($dup) {
            throw ValidationException::withMessages([
                'period' => 'This member already has a saving entry for that month.',
            ]);
        }

        $validatedStatus = $validated['status'] instanceof DepositStatus
            ? $validated['status']
            : DepositStatus::from((string) $validated['status']);

        $newPaidAt = $validatedStatus === DepositStatus::Paid
            ? ($validated['paid_at'] ?? $saving->paid_at?->toDateString() ?? now()->toDateString())
            : null;

        $payload = [
            'company_id' => $saving->company_id,
            'member_id' => $validated['member_id'],
            'period' => $periodStart,
            'amount' => $validated['amount'],
            'status' => $validatedStatus,
            'paid_at' => $newPaidAt,
        ];

        if ($request->user()->isCompanyAdmin()) {
            $payload = array_merge($payload, $request->validate([
                'company_approval_status' => ['required', Rule::enum(CompanyApprovalStatus::class)],
            ]));
        } else {
            // Financial statements only include approved records. Sending every staff
            // edit back to "pending" hid updates from reports; re-approval is only
            // required when financial fields change on an already-approved row.
            $wasApproved = $saving->company_approval_status === CompanyApprovalStatus::Approved;
            $materialChanged = $this->savingMaterialFieldsChanged(
                $saving,
                $validated,
                $periodStart,
                $newPaidAt,
            );
            $payload['company_approval_status'] = ($wasApproved && ! $materialChanged)
                ? CompanyApprovalStatus::Approved
                : CompanyApprovalStatus::PendingApproval;
        }

        $saving->update($payload);

        return redirect()->route('savings.index')->with('status', 'Saving record updated.');
    }

    public function destroy(MonthlyDeposit $saving): RedirectResponse
    {
        $saving->delete();

        return redirect()->route('savings.index')->with('status', 'Saving record removed.');
    }

    /**
     * @return Builder<MonthlyDeposit>
     */
    private function savingsQueryForUser(Request $request, int $companyId): Builder
    {
        $query = MonthlyDeposit::query()->forCompany($companyId);

        if ($request->user()->isCompanyEndUser()) {
            $email = strtolower(trim($request->user()->email));
            $query->whereHas('member', function (Builder $m) use ($companyId, $email): void {
                $m->where('company_id', $companyId)
                    ->whereNotNull('email')
                    ->whereRaw('LOWER(TRIM(email)) = ?', [$email]);
            });
        }

        return $query;
    }

    /**
     * Members who may receive monthly savings rows: registered (serial) and savings account opened.
     *
     * @return list<array{id: int, name: string, member_number: int|null, savings_account_number: string|null}>
     */
    private function membersForSavingsForms(int $companyId, ?int $alwaysIncludeMemberId = null): array
    {
        return Member::query()
            ->forCompany($companyId)
            ->whereNotNull('member_number')
            ->where(function (Builder $w) use ($alwaysIncludeMemberId): void {
                $w->where(function (Builder $inner): void {
                    $inner->whereNotNull('savings_account_number')
                        ->where('savings_account_number', '!=', '');
                });
                if ($alwaysIncludeMemberId !== null && $alwaysIncludeMemberId > 0) {
                    $w->orWhere('id', $alwaysIncludeMemberId);
                }
            })
            ->orderBy('name')
            ->get(['id', 'name', 'member_number', 'savings_account_number'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'member_number' => $m->member_number,
                'savings_account_number' => $m->savings_account_number,
            ])
            ->all();
    }

    private function ensureMemberEligibleForSavingRecords(Member $member): void
    {
        if ($member->member_number === null) {
            throw ValidationException::withMessages([
                'member_id' => 'This member is not fully registered (no serial number). Complete member registration first.',
            ]);
        }

        if (! filled($member->savings_account_number)) {
            throw ValidationException::withMessages([
                'member_id' => 'Open a savings account for this member before recording monthly savings.',
            ]);
        }
    }

    /**
     * Registered members who still need a savings account number.
     *
     * @return list<array{id: int, name: string, member_number: int|null, savings_account_number: string|null}>
     */
    private function membersPendingSavingsAccount(int $companyId): array
    {
        return Member::query()
            ->forCompany($companyId)
            ->whereNotNull('member_number')
            ->where(function (Builder $q): void {
                $q->whereNull('savings_account_number')
                    ->orWhere('savings_account_number', '');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'member_number', 'savings_account_number'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'member_number' => $m->member_number,
                'savings_account_number' => $m->savings_account_number,
            ])
            ->all();
    }

    /**
     * @return list<array{id: int, code: string, name: string}>
     */
    private function savingProductsForCompany(int $companyId): array
    {
        return Product::query()
            ->forCompany($companyId)
            ->where('type', ProductType::Savings->value)
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name'])
            ->map(fn (Product $p) => [
                'id' => (int) $p->id,
                'code' => (string) $p->code,
                'name' => (string) $p->name,
            ])
            ->all();
    }

    /**
     * Members with no monthly saving row for the given month (period = first day of month).
     *
     * @return list<array{id: int, name: string, member_number: int|null}>
     */
    private function membersMissingSavingForMonth(
        Request $request,
        int $companyId,
        string $monthStart,
    ): array {
        $withSaving = MonthlyDeposit::query()
            ->forCompany($companyId)
            ->where('period', $monthStart)
            ->pluck('member_id')
            ->unique()
            ->values();

        $q = Member::query()
            ->forCompany($companyId)
            ->whereNotNull('member_number')
            ->whereNotNull('savings_account_number')
            ->where('savings_account_number', '!=', '')
            ->orderBy('name');

        if ($withSaving->isNotEmpty()) {
            $q->whereNotIn('id', $withSaving->all());
        }

        if ($request->user()->isCompanyEndUser()) {
            $email = strtolower(trim($request->user()->email));
            $q->whereNotNull('email')
                ->whereRaw('LOWER(TRIM(email)) = ?', [$email]);
        }

        return $q->get(['id', 'name', 'member_number', 'savings_account_number'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'member_number' => $m->member_number,
                'savings_account_number' => $m->savings_account_number,
            ])
            ->all();
    }

    /**
     * @param  array{member_id: int, amount: mixed, status: DepositStatus|string, paid_at?: string|null}  $validated
     */
    private function savingMaterialFieldsChanged(
        MonthlyDeposit $saving,
        array $validated,
        string $periodStart,
        ?string $newPaidAt,
    ): bool {
        $newStatus = $validated['status'] instanceof DepositStatus
            ? $validated['status']
            : DepositStatus::from($validated['status']);

        if (abs((float) $validated['amount'] - (float) $saving->amount) > 0.000001) {
            return true;
        }
        if ((int) $validated['member_id'] !== (int) $saving->member_id) {
            return true;
        }
        if ($periodStart !== $saving->period->toDateString()) {
            return true;
        }
        if ($newStatus !== $saving->status) {
            return true;
        }
        $oldPaidAt = $saving->paid_at?->toDateString();
        if ($newStatus === DepositStatus::Paid && $newPaidAt !== $oldPaidAt) {
            return true;
        }

        return false;
    }
}
