<?php

namespace App\Http\Controllers;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Models\ChartOfAccount;
use App\Models\JournalLine;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\SavingsTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingsStatementController extends Controller
{
    public function __invoke(Request $request, Member $member): Response
    {
        $this->authorize('view', $member);

        $companyId = (int) $request->user()->company_id;
        abort_unless((int) $member->company_id === $companyId, 404);

        $member->loadMissing('company:id,name,currency');

        $depositRows = MonthlyDeposit::query()
            ->forCompany($companyId)
            ->where('member_id', $member->id)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->where('status', DepositStatus::Paid)
            ->orderBy('paid_at')
            ->get(['period', 'paid_at', 'amount'])
            ->map(fn (MonthlyDeposit $d) => [
                'date' => $d->paid_at?->toDateString() ?? $d->period?->toDateString(),
                'type' => 'deposit',
                'reference' => null,
                'notes' => null,
                'amount' => (float) $d->amount,
            ])
            ->all();

        $ledgerRows = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('savings_transactions')) {
            $ledgerRows = SavingsTransaction::query()
                ->forCompany($companyId)
                ->where('member_id', $member->id)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->orderBy('occurred_at')
                ->get(['type', 'amount', 'occurred_at', 'reference', 'notes'])
                ->map(fn (SavingsTransaction $t) => [
                    'date' => $t->occurred_at?->toDateString(),
                    'type' => $t->type,
                    'reference' => $t->reference,
                    'notes' => $t->notes,
                    'amount' => (float) $t->amount,
                ])
                ->all();
        }

        $journalRows = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('journal_entries') && \Illuminate\Support\Facades\Schema::hasTable('journal_lines')) {
            $journalRows = JournalLine::query()
                ->selectRaw('journal_entries.occurred_at as occurred_at, journal_entries.reference as reference, journal_entries.memo as memo, journal_lines.debit as debit, journal_lines.credit as credit, chart_of_accounts.code as code')
                ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
                ->join('chart_of_accounts', 'chart_of_accounts.id', '=', 'journal_lines.chart_of_account_id')
                ->where('journal_entries.company_id', $companyId)
                ->where('journal_entries.member_id', $member->id)
                ->where('chart_of_accounts.code', '2100')
                ->orderBy('journal_entries.occurred_at')
                ->get()
                ->map(function ($r): array {
                    $debit = (float) ($r->debit ?? 0);
                    $credit = (float) ($r->credit ?? 0);
                    // Savings payable (liability): credit increases balance (deposit), debit decreases (withdraw)
                    $net = $credit - $debit;
                    return [
                        'date' => (string) $r->occurred_at,
                        'type' => $net >= 0 ? 'adjustment_deposit' : 'adjustment_withdraw',
                        'reference' => $r->reference,
                        'notes' => $r->memo,
                        'amount' => abs($net),
                    ];
                })
                ->all();
        }

        $rowsRaw = array_merge($depositRows, $ledgerRows, $journalRows);
        usort($rowsRaw, fn ($a, $b) => strcmp((string) $a['date'], (string) $b['date']));

        $running = 0.0;
        $rows = array_map(function (array $r) use (&$running): array {
            $type = (string) ($r['type'] ?? '');
            $isWithdraw = in_array($type, [
                SavingsTransaction::TYPE_WITHDRAW,
                'adjustment_withdraw',
            ], true);
            $signed = $isWithdraw ? -abs((float) $r['amount']) : abs((float) $r['amount']);
            $running += $signed;

            return [
                'date' => $r['date'],
                'type' => $type === 'adjustment_deposit' ? 'adjustment' : ($type === 'adjustment_withdraw' ? 'adjustment' : $type),
                'reference' => $r['reference'],
                'notes' => $r['notes'],
                'deposit' => $signed > 0 ? number_format($signed, 2, '.', '') : null,
                'withdraw' => $signed < 0 ? number_format(abs($signed), 2, '.', '') : null,
                'balance' => number_format($running, 2, '.', ''),
            ];
        }, $rowsRaw);

        $total = $running;

        return Inertia::render('Members/SavingsStatement', [
            'company' => $member->company?->only(['name', 'currency']),
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'member_number' => $member->member_number,
                'savings_account_number' => $member->savings_account_number,
            ],
            'rows' => $rows,
            'total' => number_format($total, 2, '.', ''),
        ]);
    }
}

