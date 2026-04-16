<?php

namespace App\Http\Controllers;

use App\Enums\CompanyApprovalStatus;
use App\Enums\LoanStatus;
use App\Enums\ProductType;
use App\Models\Loan;
use App\Models\Member;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Loan::class, 'loan');
    }

    public function index(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        $loans = $this->loansQueryForUser($request, $companyId)
            ->with([
                'company:id,currency',
                'member:id,name',
            ])
            ->withSum('repayments', 'amount')
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'loan_account_number' => $loan->loan_account_number,
                'principal' => (string) $loan->principal,
                'issued_at' => $loan->issued_at->format('Y-m-d'),
                'due_date' => $loan->due_date?->format('Y-m-d'),
                'status' => $loan->status->value,
                'company_approval_status' => $loan->company_approval_status->value,
                'repaid' => (string) ($loan->repayments_sum_amount ?? '0'),
                'currency' => $loan->company?->currency ?? config('app.default_currency'),
                'member' => [
                    'id' => $loan->member->id,
                    'name' => $loan->member->name,
                ],
            ]);

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
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

        return Inertia::render('Loans/Create', [
            'members' => $this->membersForCompany($companyId),
            'loan_products' => $this->loanProductsForCompany($companyId),
            'currency' => $company?->currency ?? config('app.default_currency'),
            'default_member_id' => $defaultMemberId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'member_id' => ['required', 'integer'],
            'product_code' => ['nullable', 'string', 'max:32'],
            'loan_account_number' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('loans', 'loan_account_number')
                    ->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'principal' => ['required', 'numeric', 'min:0.01'],
            'issued_at' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'status' => ['required', Rule::enum(LoanStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);

        $validated['due_date'] = filled($validated['due_date'] ?? null)
            ? $validated['due_date']
            : null;

        $validated['company_id'] = $companyId;
        $validated['company_approval_status'] = $request->user()->isCompanyAdmin()
            ? CompanyApprovalStatus::Approved
            : CompanyApprovalStatus::PendingApproval;

        if (! filled($validated['loan_account_number'] ?? null)) {
            unset($validated['loan_account_number']);
        }
        $productCode = isset($validated['product_code']) && is_string($validated['product_code'])
            ? strtoupper(trim($validated['product_code']))
            : '';
        unset($validated['product_code']);

        $loanPrefix = 'LN';
        if ($productCode !== '') {
            $product = Product::query()
                ->forCompany($companyId)
                ->where('type', ProductType::Loan->value)
                ->where('code', $productCode)
                ->first();
            if ($product !== null) {
                $loanPrefix = strtoupper(trim((string) $product->code));
            }
        }

        $loan = null;
        if (! isset($validated['loan_account_number'])) {
            $attempt = 0;
            while ($attempt < 5) {
                $attempt++;
                $validated['loan_account_number'] = $this->nextLoanAccountNumber($companyId, $loanPrefix.'-');
                try {
                    $loan = Loan::query()->create($validated);
                    break;
                } catch (QueryException $e) {
                    $loan = null;
                    continue;
                }
            }
        }

        if ($loan === null) {
            $loan = Loan::query()->create($validated);
        }

        return redirect()->route('loans.index')->with('status', 'Loan created.');
    }

    public function edit(Request $request, Loan $loan): Response
    {
        $companyId = (int) $request->user()->company_id;

        $loan->load([
            'company:id,currency',
            'repayments' => fn ($q) => $q->orderByDesc('paid_at'),
        ]);

        return Inertia::render('Loans/Edit', [
            'loan' => [
                'id' => $loan->id,
                'member_id' => $loan->member_id,
                'loan_account_number' => $loan->loan_account_number,
                'principal' => (string) $loan->principal,
                'issued_at' => $loan->issued_at->format('Y-m-d'),
                'due_date' => $loan->due_date?->format('Y-m-d'),
                'status' => $loan->status->value,
                'notes' => $loan->notes,
                'company_approval_status' => $loan->company_approval_status->value,
                'currency' => $loan->company?->currency ?? config('app.default_currency'),
                'repayments' => $loan->repayments->map(fn ($r) => [
                    'id' => $r->id,
                    'amount' => (string) $r->amount,
                    'paid_at' => $r->paid_at->format('Y-m-d'),
                    'notes' => $r->notes,
                ]),
            ],
            'members' => $this->membersForCompany($companyId),
            'canRepay' => $request->user()->can('repay', $loan),
            'canApproveRecords' => $request->user()->canApproveCompanyPortalRecords(),
        ]);
    }

    public function update(Request $request, Loan $loan): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'member_id' => ['required', 'integer'],
            'loan_account_number' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('loans', 'loan_account_number')
                    ->where(fn ($q) => $q->where('company_id', $companyId))
                    ->ignore($loan->id),
            ],
            'principal' => ['required', 'numeric', 'min:0.01'],
            'issued_at' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'status' => ['required', Rule::enum(LoanStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);

        $validated['due_date'] = filled($validated['due_date'] ?? null)
            ? $validated['due_date']
            : null;

        $validated['company_id'] = $loan->company_id;

        if ($request->user()->isCompanyAdmin()) {
            $validated = array_merge($validated, $request->validate([
                'company_approval_status' => ['required', Rule::enum(CompanyApprovalStatus::class)],
            ]));
        } else {
            // Same as savings: staff used to reset every edit to pending, which removed
            // loans from approved-only financial statements until an admin re-opened them.
            $wasApproved = $loan->company_approval_status === CompanyApprovalStatus::Approved;
            $materialChanged = $this->loanMaterialFieldsChanged($loan, $validated);
            $validated['company_approval_status'] = ($wasApproved && ! $materialChanged)
                ? CompanyApprovalStatus::Approved
                : CompanyApprovalStatus::PendingApproval;
        }

        $loan->update($validated);

        return redirect()->route('loans.index')->with('status', 'Loan updated.');
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        $loan->delete();

        return redirect()->route('loans.index')->with('status', 'Loan removed.');
    }

    /**
     * @return Builder<Loan>
     */
    private function loansQueryForUser(Request $request, int $companyId): Builder
    {
        $query = Loan::query()->forCompany($companyId);

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
     * @return list<array{id: int, name: string}>
     */
    private function membersForCompany(int $companyId): array
    {
        return Member::query()
            ->forCompany($companyId)
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
     * @param  array{member_id: int, principal: mixed, issued_at: string, status: LoanStatus|string}  $validated
     */
    private function loanMaterialFieldsChanged(Loan $loan, array $validated): bool
    {
        $newStatus = $validated['status'] instanceof LoanStatus
            ? $validated['status']
            : LoanStatus::from((string) $validated['status']);

        if (abs((float) $validated['principal'] - (float) $loan->principal) > 0.000001) {
            return true;
        }
        if ((int) $validated['member_id'] !== (int) $loan->member_id) {
            return true;
        }
        $newIssued = Carbon::parse($validated['issued_at'])->toDateString();
        if ($newIssued !== $loan->issued_at->toDateString()) {
            return true;
        }
        if ($newStatus !== $loan->status) {
            return true;
        }

        return false;
    }

    private function nextLoanAccountNumber(int $companyId, string $prefix = 'LN-'): string
    {
        $values = Loan::query()
            ->forCompany($companyId)
            ->whereNotNull('loan_account_number')
            ->where('loan_account_number', 'like', $prefix.'%')
            ->pluck('loan_account_number')
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

        return $prefix.str_pad((string) ($max + 1), 6, '0', STR_PAD_LEFT);
    }

    /**
     * @return list<array{id: int, code: string, name: string}>
     */
    private function loanProductsForCompany(int $companyId): array
    {
        return Product::query()
            ->forCompany($companyId)
            ->where('type', ProductType::Loan->value)
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
}
