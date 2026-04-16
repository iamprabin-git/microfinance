<?php

namespace App\Http\Controllers;

use App\Enums\CompanyApprovalStatus;
use App\Models\Member;
use App\Models\SavingsTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SavingsTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        $companyId = (int) $request->user()->company_id;

        $tx = SavingsTransaction::query()
            ->forCompany($companyId)
            ->with(['member:id,name,member_number,savings_account_number', 'company:id,currency'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(fn (SavingsTransaction $t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => (string) $t->amount,
                'occurred_at' => $t->occurred_at?->toDateString(),
                'status' => (string) $t->status,
                'company_approval_status' => $t->company_approval_status->value,
                'reference' => $t->reference,
                'notes' => $t->notes,
                'currency' => $t->company?->currency ?? config('app.default_currency'),
                'member' => [
                    'id' => $t->member?->id,
                    'name' => $t->member?->name ?? '—',
                    'member_number' => $t->member?->member_number,
                    'savings_account_number' => $t->member?->savings_account_number,
                ],
            ])
            ->all();

        return Inertia::render('SavingsTransactions/Index', [
            'transactions' => $tx,
            'can_post' => (bool) $request->user()?->isCompanyAdmin(),
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

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

        $defaultType = $request->query('type');
        if (! in_array($defaultType, [SavingsTransaction::TYPE_DEPOSIT, SavingsTransaction::TYPE_WITHDRAW], true)) {
            $defaultType = SavingsTransaction::TYPE_WITHDRAW;
        }

        $members = Member::query()
            ->forCompany($companyId)
            ->whereNotNull('member_number')
            ->whereNotNull('savings_account_number')
            ->where('savings_account_number', '!=', '')
            ->orderBy('name')
            ->get(['id', 'name', 'member_number', 'savings_account_number'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'member_number' => $m->member_number,
                'savings_account_number' => $m->savings_account_number,
            ])
            ->all();

        $blockedReason = $members === []
            ? 'No members with an open savings account yet. Register a member (serial number), then issue a savings account on their profile before using the savings ledger.'
            : null;

        return Inertia::render('SavingsTransactions/Create', [
            'members' => $members,
            'currency' => $company?->currency ?? config('app.default_currency'),
            'default_member_id' => $defaultMemberId,
            'default_type' => $defaultType,
            'blockedReason' => $blockedReason,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'member_id' => ['required', 'integer'],
            'type' => ['required', 'string', Rule::in([SavingsTransaction::TYPE_DEPOSIT, SavingsTransaction::TYPE_WITHDRAW])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'occurred_at' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:128'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $member = Member::query()->forCompany($companyId)->findOrFail($validated['member_id']);
        if ($member->member_number === null) {
            throw ValidationException::withMessages([
                'member_id' => 'Member must be registered (serial number) before posting savings ledger entries.',
            ]);
        }
        if (! filled($member->savings_account_number)) {
            throw ValidationException::withMessages([
                'member_id' => 'Open a savings account for this member before posting deposits or withdrawals.',
            ]);
        }

        SavingsTransaction::query()->create([
            'company_id' => $companyId,
            'member_id' => $validated['member_id'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'occurred_at' => $validated['occurred_at'],
            'status' => 'paid',
            'company_approval_status' => CompanyApprovalStatus::Approved,
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()
            ->route('savings-transactions.index')
            ->with('status', 'Savings transaction recorded.');
    }
}

