<?php

namespace App\Http\Controllers;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Models\Member;
use App\Models\MonthlyDeposit;
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
                'member:id,name',
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

        return Inertia::render('Savings/Create', [
            'members' => $this->membersForCompany($companyId),
            'currency' => $company?->currency ?? config('app.default_currency'),
            'default_member_id' => $defaultMemberId,
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

        Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);

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
            'members' => $this->membersForCompany($companyId),
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

        Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);

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
     * @return list<array{id: int, name: string, member_number: int|null}>
     */
    private function membersForCompany(int $companyId): array
    {
        return Member::query()
            ->forCompany($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'member_number'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'member_number' => $m->member_number,
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
            ->orderBy('name');

        if ($withSaving->isNotEmpty()) {
            $q->whereNotIn('id', $withSaving->all());
        }

        if ($request->user()->isCompanyEndUser()) {
            $email = strtolower(trim($request->user()->email));
            $q->whereNotNull('email')
                ->whereRaw('LOWER(TRIM(email)) = ?', [$email]);
        }

        return $q->get(['id', 'name', 'member_number'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'member_number' => $m->member_number,
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
