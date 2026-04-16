<?php

namespace App\Services\FinancialReporting;

use App\Enums\CompanyApprovalStatus;
use App\Enums\ChartOfAccountType;
use App\Enums\DepositStatus;
use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\FinancialTransaction;
use App\Models\JournalLine;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\SavingsTransaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

final class FinancialReportsBuilder
{
    public function __construct(
        private int $companyId,
        private ?array $memberIds,
        private string $currency,
    ) {}

    public static function forUser(User $user): self
    {
        $companyId = (int) $user->company_id;
        $memberIds = null;
        if ($user->isCompanyEndUser()) {
            $email = strtolower(trim($user->email));
            $memberIds = Member::query()
                ->forCompany($companyId)
                ->whereNotNull('email')
                ->whereRaw('LOWER(TRIM(email)) = ?', [$email])
                ->pluck('id')
                ->all();
        }

        $currency = Company::query()
            ->where('id', $companyId)
            ->value('currency') ?? config('app.default_currency');

        return new self($companyId, $memberIds, $currency);
    }

    public function currency(): string
    {
        return $this->currency;
    }

    /**
     * Snapshot for the company portal dashboard (charts, KPIs, ratios).
     *
     * @return array{
     *     as_of: string,
     *     currency: string,
     *     kpis: array{
     *         assets: float,
     *         liabilities: float,
     *         equity: float,
     *         net_activity_mtd: float,
     *         income_mtd: float,
     *         expenses_mtd: float,
     *     },
     *     monthly_trend: list<array{key: string, label: string, income: float, expenses: float, net: float}>,
     *     income_mix: list<array{name: string, value: float}>,
     *     expense_mix: list<array{name: string, value: float}>,
     *     balance_structure: list<array{name: string, value: float}>,
     *     ratios: list<array{key: string, label: string, value: float|null, display: string}>,
     * }
     */
    public function dashboardAnalytics(): array
    {
        $now = Carbon::now();
        $asOfEnd = $now->copy()->endOfDay();

        $loansOutstanding = $this->loansOutstanding($asOfEnd);
        $savingsPayable = $this->cumulativeSavingsPaid($asOfEnd);
        $cashPosition = $this->cashPositionThrough($asOfEnd);
        $equity = $loansOutstanding + $cashPosition - $savingsPayable;

        $cashAsset = max(0.0, $cashPosition);
        $cashOverdraft = max(0.0, -$cashPosition);
        $assetsTotal = $loansOutstanding + $cashAsset;
        $liabilitiesTotal = $savingsPayable + $cashOverdraft;

        $monthStart = $now->copy()->startOfMonth()->startOfDay();
        $monthEnd = $now->copy()->endOfDay();
        $repM = $this->repaymentsInRange($monthStart, $monthEnd);
        $savM = $this->savingsPaidInRange($monthStart, $monthEnd);
        $disbM = $this->loansDisbursedInRange($monthStart, $monthEnd);
        [$oiM, $oeM] = $this->financialTransactionTotals($monthStart, $monthEnd);

        $incomeMtd = $repM + $savM + $oiM;
        $expenseMtd = $disbM + $oeM;
        $netMtd = $incomeMtd - $expenseMtd;

        $incomeMix = [];
        if ($repM > 0.0001) {
            $incomeMix[] = ['name' => 'Loan repayments', 'value' => round($repM, 2)];
        }
        if ($savM > 0.0001) {
            $incomeMix[] = ['name' => 'Savings received', 'value' => round($savM, 2)];
        }
        if ($oiM > 0.0001) {
            $incomeMix[] = ['name' => 'Other income', 'value' => round($oiM, 2)];
        }

        $expenseMix = [];
        if ($disbM > 0.0001) {
            $expenseMix[] = ['name' => 'Loans disbursed', 'value' => round($disbM, 2)];
        }
        if ($oeM > 0.0001) {
            $expenseMix[] = ['name' => 'Operating expenses', 'value' => round($oeM, 2)];
        }

        $balanceStructure = [
            ['name' => 'Loans receivable', 'value' => round($loansOutstanding, 2)],
            ['name' => 'Cash', 'value' => round($cashAsset, 2)],
            ['name' => 'Savings payable', 'value' => round($savingsPayable, 2)],
            ['name' => 'Member funding (overdraft)', 'value' => round($cashOverdraft, 2)],
        ];
        if ($equity >= 0) {
            $balanceStructure[] = ['name' => "Members' equity", 'value' => round($equity, 2)];
        } else {
            $balanceStructure[] = ['name' => 'Accumulated deficit', 'value' => round(abs($equity), 2)];
        }
        $balanceStructure = array_values(array_filter(
            $balanceStructure,
            static fn (array $row): bool => $row['value'] > 0.0001
        ));

        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $ms = $now->copy()->startOfMonth()->subMonths($i)->startOfDay();
            $me = $ms->copy()->endOfMonth()->endOfDay();
            if ($me->greaterThan($now)) {
                $me = $now->copy()->endOfDay();
            }
            $r = $this->repaymentsInRange($ms, $me);
            $s = $this->savingsPaidInRange($ms, $me);
            $d = $this->loansDisbursedInRange($ms, $me);
            [$oi, $oe] = $this->financialTransactionTotals($ms, $me);
            $inc = $r + $s + $oi;
            $exp = $d + $oe;
            $monthlyTrend[] = [
                'key' => $ms->format('Y-m'),
                'label' => $ms->format('M Y'),
                'income' => round($inc, 2),
                'expenses' => round($exp, 2),
                'net' => round($inc - $exp, 2),
            ];
        }

        $ratios = [];
        if ($assetsTotal > 0.0001) {
            $ratios[] = [
                'key' => 'equity_to_assets',
                'label' => 'Equity to assets',
                'value' => round($equity / $assetsTotal, 4),
                'display' => $this->fmtRatioAsPercent($equity / $assetsTotal),
            ];
        }
        if ($loansOutstanding > 0.0001) {
            $ratios[] = [
                'key' => 'savings_to_loans',
                'label' => 'Savings payable / loans receivable',
                'value' => round($savingsPayable / $loansOutstanding, 4),
                'display' => number_format($savingsPayable / $loansOutstanding, 2).'×',
            ];
        }
        if ($liabilitiesTotal > 0.0001 && $cashAsset > 0.0001) {
            $ratios[] = [
                'key' => 'cash_to_liabilities',
                'label' => 'Cash / total liabilities',
                'value' => round($cashAsset / $liabilitiesTotal, 4),
                'display' => $this->fmtRatioAsPercent($cashAsset / $liabilitiesTotal),
            ];
        }
        if ($incomeMtd > 0.0001) {
            $ratios[] = [
                'key' => 'net_margin_mtd',
                'label' => 'Net margin (month to date)',
                'value' => round($netMtd / $incomeMtd, 4),
                'display' => $this->fmtRatioAsPercent($netMtd / $incomeMtd),
            ];
        }
        if ($assetsTotal > 0.0001 && $liabilitiesTotal > 0.0001) {
            $ratios[] = [
                'key' => 'debt_to_assets',
                'label' => 'Liabilities to assets',
                'value' => round($liabilitiesTotal / $assetsTotal, 4),
                'display' => $this->fmtRatioAsPercent($liabilitiesTotal / $assetsTotal),
            ];
        }

        return [
            'as_of' => $now->toDateString(),
            'currency' => $this->currency,
            'kpis' => [
                'assets' => round($assetsTotal, 2),
                'liabilities' => round($liabilitiesTotal, 2),
                'equity' => round($equity, 2),
                'net_activity_mtd' => round($netMtd, 2),
                'income_mtd' => round($incomeMtd, 2),
                'expenses_mtd' => round($expenseMtd, 2),
            ],
            'monthly_trend' => $monthlyTrend,
            'income_mix' => $incomeMix,
            'expense_mix' => $expenseMix,
            'balance_structure' => $balanceStructure,
            'ratios' => $ratios,
        ];
    }

    private function fmtRatioAsPercent(float $ratio): string
    {
        return number_format($ratio * 100, 1).'%';
    }

    /**
     * @return array{rows: list<array{code: string, name: string, debit: string|null, credit: string|null}>, total_debit: string, total_credit: string, as_of: string}
     */
    public function trialBalance(Carbon $asOf): array
    {
        $asOfDate = $asOf->copy()->endOfDay();
        $asOfStr = $asOf->toDateString();

        $loansOutstanding = $this->loansOutstanding($asOfDate);
        $savingsPayable = $this->cumulativeSavingsPaid($asOfDate);
        $cashPosition = $this->cashPositionThrough($asOfDate);
        $journalSums = $this->journalSumsThroughByCode($asOfDate);

        $required = collect([
            ['code' => '1010', 'type' => ChartOfAccountType::Asset, 'name' => 'Cash and bank (net of disbursements)'],
            ['code' => '1100', 'type' => ChartOfAccountType::Asset, 'name' => 'Loans receivable (net of repayments)'],
            ['code' => '2015', 'type' => ChartOfAccountType::Liability, 'name' => 'Net funding from members (cash deficit)'],
            ['code' => '2100', 'type' => ChartOfAccountType::Liability, 'name' => 'Member savings deposits held (paid contributions)'],
            ['code' => '3900', 'type' => ChartOfAccountType::Capital, 'name' => "Members' equity / accumulated surplus (balancing)"],
            ['code' => '3910', 'type' => ChartOfAccountType::Capital, 'name' => "Members' equity / accumulated deficit (balancing)"],
        ]);

        $accounts = $this->activeChartAccounts()
            ->map(fn (ChartOfAccount $a) => [
                'code' => $a->code,
                'name' => $a->name,
                'type' => $a->type,
            ]);

        $missing = $required
            ->reject(fn (array $r) => $accounts->contains(fn (array $a) => $a['code'] === $r['code']))
            ->map(fn (array $r) => [
                'code' => $r['code'],
                'name' => $r['name'],
                'type' => $r['type'],
            ]);

        $accounts = $accounts
            ->concat($missing)
            ->sortBy('code', SORT_NATURAL)
            ->values();

        $journalTotalDebit = (float) collect($journalSums)->sum('debit');
        $journalTotalCredit = (float) collect($journalSums)->sum('credit');

        $totalDebit = $loansOutstanding + max(0, $cashPosition) + $journalTotalDebit;
        $totalCredit = $savingsPayable + max(0, -$cashPosition) + $journalTotalCredit;
        $plug = $totalDebit - $totalCredit;

        if ($plug > 0) {
            $totalCredit += $plug;
        } elseif ($plug < 0) {
            $totalDebit += abs($plug);
        }

        $rows = $accounts->map(function (array $account) use ($loansOutstanding, $savingsPayable, $cashPosition, $plug, $journalSums): array {
            $code = (string) $account['code'];
            $name = (string) $account['name'];

            $debit = null;
            $credit = null;

            if ($code === '1100' && $loansOutstanding > 0) {
                $debit = $this->fmt($loansOutstanding);
            }
            if ($code === '1010' && $cashPosition > 0) {
                $debit = $this->fmt($cashPosition);
            }
            if ($code === '2015' && $cashPosition < 0) {
                $credit = $this->fmt(abs($cashPosition));
            }
            if ($code === '2100' && $savingsPayable > 0) {
                $credit = $this->fmt($savingsPayable);
            }
            if ($code === '3900' && $plug > 0) {
                $credit = $this->fmt($plug);
            }
            if ($code === '3910' && $plug < 0) {
                $debit = $this->fmt(abs($plug));
            }

            $j = $journalSums[$code] ?? null;
            if ($j !== null) {
                $d = (float) ($debit ?? 0);
                $c = (float) ($credit ?? 0);
                $d += (float) $j['debit'];
                $c += (float) $j['credit'];
                $debit = $d > 0.000001 ? $this->fmt($d) : null;
                $credit = $c > 0.000001 ? $this->fmt($c) : null;
            }

            return [
                'code' => $code,
                'name' => $name,
                'debit' => $debit,
                'credit' => $credit,
            ];
        })->all();

        return [
            'rows' => $rows,
            'total_debit' => $this->fmt($totalDebit),
            'total_credit' => $this->fmt($totalCredit),
            'as_of' => $asOfStr,
        ];
    }

    /**
     * @return array{assets: list<array{label: string, amount: string}>, liabilities: list<array{label: string, amount: string}>, equity: list<array{label: string, amount: string}>, as_of: string}
     */
    public function balanceSheet(Carbon $asOf): array
    {
        $asOfDate = $asOf->copy()->endOfDay();
        $asOfStr = $asOf->toDateString();

        $loansOutstanding = $this->loansOutstanding($asOfDate);
        $savingsPayable = $this->cumulativeSavingsPaid($asOfDate);
        $cashPosition = $this->cashPositionThrough($asOfDate);
        $equity = $loansOutstanding + $cashPosition - $savingsPayable;
        $journalNet = $this->journalNetThroughByCodeAndType($asOfDate);

        $required = collect([
            ['code' => '1010', 'type' => ChartOfAccountType::Asset, 'name' => 'Cash and bank (net of disbursements)'],
            ['code' => '1100', 'type' => ChartOfAccountType::Asset, 'name' => 'Loans receivable (net of repayments)'],
            ['code' => '2015', 'type' => ChartOfAccountType::Liability, 'name' => 'Net funding from members (cash deficit)'],
            ['code' => '2100', 'type' => ChartOfAccountType::Liability, 'name' => 'Member savings deposits held (paid contributions)'],
            ['code' => '3900', 'type' => ChartOfAccountType::Capital, 'name' => "Members' equity / accumulated surplus (balancing)"],
            ['code' => '3910', 'type' => ChartOfAccountType::Capital, 'name' => "Members' equity / accumulated deficit (balancing)"],
        ]);

        $accounts = $this->activeChartAccounts()
            ->map(fn (ChartOfAccount $a) => [
                'code' => $a->code,
                'name' => $a->name,
                'type' => $a->type,
            ]);

        $missing = $required
            ->reject(fn (array $r) => $accounts->contains(fn (array $a) => $a['code'] === $r['code']))
            ->map(fn (array $r) => [
                'code' => $r['code'],
                'name' => $r['name'],
                'type' => $r['type'],
            ]);

        $accounts = $accounts
            ->concat($missing)
            ->sortBy('code', SORT_NATURAL)
            ->values();

        $balances = [
            '1100' => $loansOutstanding,
            '1010' => max(0.0, $cashPosition),
            '2100' => $savingsPayable,
            '2015' => max(0.0, -$cashPosition),
            '3900' => max(0.0, $equity),
            '3910' => max(0.0, -$equity),
        ];

        foreach ($journalNet as $code => $net) {
            if (! array_key_exists($code, $balances)) {
                continue;
            }
            $balances[$code] = max(0.0, (float) $balances[$code] + (float) $net);
        }

        $formatLabel = static fn (array $a): string => trim($a['code'].' — '.$a['name']);

        $assets = $accounts
            ->filter(fn (array $a) => $a['type'] === ChartOfAccountType::Asset)
            ->map(fn (array $a) => [
                'label' => $formatLabel($a),
                'amount' => $this->fmt((float) ($balances[$a['code']] ?? 0.0)),
            ])
            ->values()
            ->all();

        $liabilities = $accounts
            ->filter(fn (array $a) => $a['type'] === ChartOfAccountType::Liability)
            ->map(fn (array $a) => [
                'label' => $formatLabel($a),
                'amount' => $this->fmt((float) ($balances[$a['code']] ?? 0.0)),
            ])
            ->values()
            ->all();

        $equityRows = $accounts
            ->filter(fn (array $a) => $a['type'] === ChartOfAccountType::Capital)
            ->map(fn (array $a) => [
                'label' => $formatLabel($a),
                'amount' => $this->fmt((float) ($balances[$a['code']] ?? 0.0)),
            ])
            ->values()
            ->all();

        return [
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $equityRows,
            'as_of' => $asOfStr,
        ];
    }

    /**
     * @return array{lines: list<array{label: string, amount: string, kind: string}>, net_change: string, period_from: string, period_to: string}
     */
    public function profitAndLoss(Carbon $from, Carbon $to): array
    {
        $fromDay = $from->copy()->startOfDay();
        $toDay = $to->copy()->endOfDay();

        $repayments = $this->repaymentsInRange($fromDay, $toDay);
        $savings = $this->savingsPaidInRange($fromDay, $toDay);
        $disbursed = $this->loansDisbursedInRange($fromDay, $toDay);
        [$otherIncome, $otherExpense] = $this->financialTransactionTotals($fromDay, $toDay);
        [$journalIncome, $journalExpense] = $this->journalProfitLossTotals($fromDay, $toDay);

        $lines = [
            [
                'label' => 'Loan repayments received (cash)',
                'amount' => $this->fmt($repayments),
                'kind' => 'inflow',
            ],
            [
                'label' => 'Savings contributions received (cash)',
                'amount' => $this->fmt($savings),
                'kind' => 'inflow',
            ],
            [
                'label' => 'New loans disbursed (cash out)',
                'amount' => $this->fmt($disbursed),
                'kind' => 'outflow',
            ],
        ];

        if ($otherIncome > 0) {
            $incomeLabel = $this->firstChartAccountLabel(ChartOfAccountType::Income) ?? 'Other income (recorded transactions)';
            $lines[] = [
                'label' => $incomeLabel,
                'amount' => $this->fmt($otherIncome),
                'kind' => 'income',
            ];
        }
        if ($otherExpense > 0) {
            $expenseLabel = $this->firstChartAccountLabel(ChartOfAccountType::Expense) ?? 'Operating expenses (recorded transactions)';
            $lines[] = [
                'label' => $expenseLabel,
                'amount' => $this->fmt($otherExpense),
                'kind' => 'expense',
            ];
        }
        if ($journalIncome > 0.0001) {
            $lines[] = [
                'label' => 'Journal income adjustments',
                'amount' => $this->fmt($journalIncome),
                'kind' => 'income',
            ];
        }
        if ($journalExpense > 0.0001) {
            $lines[] = [
                'label' => 'Journal expense adjustments',
                'amount' => $this->fmt($journalExpense),
                'kind' => 'expense',
            ];
        }

        $net = $repayments + $savings - $disbursed + $otherIncome - $otherExpense + $journalIncome - $journalExpense;

        return [
            'lines' => $lines,
            'net_change' => $this->fmt($net),
            'period_from' => $from->toDateString(),
            'period_to' => $to->toDateString(),
        ];
    }

    /**
     * @return array{lines: list<array{label: string, amount: string}>, opening: string, closing: string, period_from: string, period_to: string}
     */
    public function cashFlow(Carbon $from, Carbon $to): array
    {
        $fromDay = $from->copy()->startOfDay();
        $toDay = $to->copy()->endOfDay();
        $dayBefore = $from->copy()->subDay()->endOfDay();

        $opening = $this->cashPositionThrough($dayBefore);
        $repayments = $this->repaymentsInRange($fromDay, $toDay);
        $savingsNet = $this->savingsPaidInRange($fromDay, $toDay);
        $withdrawals = $this->savingsWithdrawnInRange($fromDay, $toDay);
        $disbursed = $this->loansDisbursedInRange($fromDay, $toDay);
        $netPeriod = $repayments + $savingsNet - $withdrawals - $disbursed;
        $closing = $opening + $netPeriod;

        $lines = [
            ['label' => 'Loan repayments received', 'amount' => $this->fmt($repayments)],
            ['label' => 'Savings contributions received', 'amount' => $this->fmt($savingsNet)],
            ['label' => 'Savings withdrawals paid', 'amount' => $this->fmt(-$withdrawals)],
            ['label' => 'Loans disbursed', 'amount' => $this->fmt(-$disbursed)],
            ['label' => 'Net change in cash', 'amount' => $this->fmt($netPeriod)],
        ];

        return [
            'lines' => $lines,
            'opening' => $this->fmt($opening),
            'closing' => $this->fmt($closing),
            'period_from' => $from->toDateString(),
            'period_to' => $to->toDateString(),
        ];
    }

    /**
     * Savings lines in the window: paid rows use paid_at; pending-payment rows use
     * contribution period so new members show up before a pay date exists. Only
     * approved & paid with paid_at in range count toward the footer total (same as
     * other financial reports).
     *
     * @return array{
     *     rows: list<array{
     *         member_name: string,
     *         member_number: string|null,
     *         period: string|null,
     *         paid_at: string|null,
     *         amount: string,
     *         status: string,
     *         company_approval: string,
     *         included_in_total: bool,
     *     }>,
     *     total: string,
     *     total_caption: string,
     *     footnote: string,
     *     period_from: string,
     *     period_to: string,
     * }
     */
    public function savingsRegister(Carbon $from, Carbon $to): array
    {
        $fromStr = $from->copy()->startOfDay()->toDateString();
        $toStr = $to->copy()->endOfDay()->toDateString();
        // Period is stored as a date/datetime at month start; the upper bound must cover
        // the full last month (e.g. SQLite "2026-01-01 00:00:00" is not between "2026-01-01" and "2026-01-01").
        $pendingPeriodFrom = $from->copy()->startOfMonth()->toDateString();
        $pendingPeriodTo = $to->copy()->endOfMonth()->toDateString();

        $deposits = MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', '!=', CompanyApprovalStatus::Rejected->value)
            ->where(function (Builder $q) use ($fromStr, $toStr, $pendingPeriodFrom, $pendingPeriodTo): void {
                $q->where(function (Builder $q2) use ($fromStr, $toStr): void {
                    $q2->where('status', DepositStatus::Paid)
                        ->whereNotNull('paid_at')
                        ->whereBetween('paid_at', [$fromStr, $toStr]);
                })->orWhere(function (Builder $q3) use ($pendingPeriodFrom, $pendingPeriodTo): void {
                    $q3->where('status', DepositStatus::Pending)
                        ->whereBetween('period', [$pendingPeriodFrom, $pendingPeriodTo]);
                });
            })
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->with(['member:id,name,member_number'])
            ->orderByDesc('period')
            ->orderBy('member_id')
            ->orderBy('id')
            ->get();

        $includedInTotal = static function (MonthlyDeposit $d) use ($fromStr, $toStr): bool {
            if ($d->company_approval_status !== CompanyApprovalStatus::Approved) {
                return false;
            }
            if ($d->status !== DepositStatus::Paid) {
                return false;
            }
            if ($d->paid_at === null) {
                return false;
            }
            $paid = $d->paid_at->toDateString();

            return $paid >= $fromStr && $paid <= $toStr;
        };

        $total = (float) $deposits->filter($includedInTotal)->sum('amount');
        $rows = $deposits->map(function (MonthlyDeposit $d) use ($includedInTotal): array {
            $member = $d->member;

            return [
                'member_name' => $member?->name ?? '—',
                'member_number' => $member?->member_number !== null
                    ? (string) $member->member_number
                    : null,
                'period' => $d->period?->toDateString(),
                'paid_at' => $d->paid_at?->toDateString(),
                'amount' => $this->fmt((float) $d->amount),
                'status' => $d->status->label(),
                'company_approval' => $d->company_approval_status->label(),
                'included_in_total' => $includedInTotal($d),
            ];
        })->values()->all();

        return [
            'rows' => $rows,
            'total' => $this->fmt($total),
            'total_caption' => 'Total (approved & paid, paid date in range)',
            'footnote' => 'Pending contributions and company-unapproved rows appear for tracking; only approved paid deposits in the paid-date window add to the total.',
            'period_from' => $from->toDateString(),
            'period_to' => $to->toDateString(),
        ];
    }

    /**
     * Per-loan positions as of the end date, with repayments in the selected window.
     *
     * @return array{
     *     rows: list<array{
     *         member_name: string,
     *         member_number: string|null,
     *         issued_at: string|null,
     *         due_date: string|null,
     *         principal: string,
     *         repaid_cumulative: string,
     *         repaid_in_period: string,
     *         outstanding: string,
     *         status: string,
     *     }>,
     *     period_from: string,
     *     period_to: string,
     * }
     */
    public function loansRegister(Carbon $from, Carbon $to): array
    {
        $fromStr = $from->copy()->startOfDay()->toDateString();
        $toStr = $to->copy()->endOfDay()->toDateString();

        $loans = Loan::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->whereDate('issued_at', '<=', $toStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->with([
                'member:id,name,member_number',
                'repayments' => fn ($q) => $q
                    ->whereDate('paid_at', '<=', $toStr)
                    ->orderBy('paid_at'),
            ])
            ->orderBy('issued_at')
            ->orderBy('id')
            ->get();

        $rows = $loans->map(function (Loan $loan) use ($fromStr, $toStr): array {
            $repaidThrough = (float) $loan->repayments->sum('amount');
            $repaidInPeriod = (float) $loan->repayments
                ->filter(function (LoanRepayment $r) use ($fromStr, $toStr): bool {
                    if ($r->paid_at === null) {
                        return false;
                    }
                    $d = $r->paid_at->toDateString();

                    return $d >= $fromStr && $d <= $toStr;
                })
                ->sum('amount');
            $principal = (float) $loan->principal;
            $outstanding = max(0.0, $principal - $repaidThrough);
            $member = $loan->member;

            return [
                'member_name' => $member?->name ?? '—',
                'member_number' => $member?->member_number !== null
                    ? (string) $member->member_number
                    : null,
                'issued_at' => $loan->issued_at?->toDateString(),
                'due_date' => $loan->due_date?->toDateString(),
                'principal' => $this->fmt($principal),
                'repaid_cumulative' => $this->fmt($repaidThrough),
                'repaid_in_period' => $this->fmt($repaidInPeriod),
                'outstanding' => $this->fmt($outstanding),
                'status' => $loan->status->label(),
            ];
        })->values()->all();

        return [
            'rows' => $rows,
            'period_from' => $from->toDateString(),
            'period_to' => $to->toDateString(),
        ];
    }

    private function loansOutstanding(Carbon $asOfEnd): float
    {
        $asOfStr = $asOfEnd->toDateString();

        $loans = Loan::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->whereDate('issued_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->with(['repayments' => fn ($q) => $q->whereDate('paid_at', '<=', $asOfStr)])
            ->get();

        return (float) $loans->sum(function (Loan $loan): float {
            $repaid = (float) $loan->repayments->sum('amount');

            return max(0, (float) $loan->principal - $repaid);
        });
    }

    private function cumulativeSavingsPaid(Carbon $asOfEnd): float
    {
        $asOfStr = $asOfEnd->toDateString();

        $deposits = (float) MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->where('status', DepositStatus::Paid)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');

        $txDeposits = 0.0;
        $withdrawals = 0.0;
        if (Schema::hasTable('savings_transactions')) {
            $txDeposits = (float) SavingsTransaction::query()
                ->forCompany($this->companyId)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->where('type', SavingsTransaction::TYPE_DEPOSIT)
                ->whereDate('occurred_at', '<=', $asOfStr)
                ->tap(fn (Builder $q) => $this->applyMemberScope($q))
                ->sum('amount');

            $withdrawals = (float) SavingsTransaction::query()
                ->forCompany($this->companyId)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->where('type', SavingsTransaction::TYPE_WITHDRAW)
                ->whereDate('occurred_at', '<=', $asOfStr)
                ->tap(fn (Builder $q) => $this->applyMemberScope($q))
                ->sum('amount');
        }

        return max(0.0, $deposits + $txDeposits - $withdrawals);
    }

    private function cashPositionThrough(Carbon $asOfEnd): float
    {
        $asOfStr = $asOfEnd->toDateString();

        $repayments = (float) LoanRepayment::query()
            ->whereHas('loan', function (Builder $q) use ($asOfStr): void {
                $q->forCompany($this->companyId)
                    ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                    ->whereDate('issued_at', '<=', $asOfStr);
                $this->applyMemberScope($q);
            })
            ->whereDate('paid_at', '<=', $asOfStr)
            ->sum('amount');

        $savings = (float) MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->where('status', DepositStatus::Paid)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');

        $txDeposits = 0.0;
        $withdrawals = 0.0;
        if (Schema::hasTable('savings_transactions')) {
            $txDeposits = (float) SavingsTransaction::query()
                ->forCompany($this->companyId)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->where('type', SavingsTransaction::TYPE_DEPOSIT)
                ->whereDate('occurred_at', '<=', $asOfStr)
                ->tap(fn (Builder $q) => $this->applyMemberScope($q))
                ->sum('amount');

            $withdrawals = (float) SavingsTransaction::query()
                ->forCompany($this->companyId)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->where('type', SavingsTransaction::TYPE_WITHDRAW)
                ->whereDate('occurred_at', '<=', $asOfStr)
                ->tap(fn (Builder $q) => $this->applyMemberScope($q))
                ->sum('amount');
        }

        $disbursed = (float) Loan::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->whereDate('issued_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('principal');

        return $repayments + $savings + $txDeposits - $withdrawals - $disbursed;
    }

    private function repaymentsInRange(Carbon $from, Carbon $to): float
    {
        return (float) LoanRepayment::query()
            ->whereHas('loan', function (Builder $q): void {
                $q->forCompany($this->companyId)
                    ->where('company_approval_status', CompanyApprovalStatus::Approved->value);
                $this->applyMemberScope($q);
            })
            ->whereBetween('paid_at', [$from->toDateString(), $to->toDateString()])
            ->sum('amount');
    }

    private function savingsPaidInRange(Carbon $from, Carbon $to): float
    {
        $deposits = (float) MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->where('status', DepositStatus::Paid)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$from->toDateString(), $to->toDateString()])
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');

        $txDeposits = 0.0;
        $withdrawals = 0.0;
        if (Schema::hasTable('savings_transactions')) {
            $txDeposits = (float) SavingsTransaction::query()
                ->forCompany($this->companyId)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->where('type', SavingsTransaction::TYPE_DEPOSIT)
                ->whereBetween('occurred_at', [$from->toDateString(), $to->toDateString()])
                ->tap(fn (Builder $q) => $this->applyMemberScope($q))
                ->sum('amount');

            $withdrawals = (float) SavingsTransaction::query()
                ->forCompany($this->companyId)
                ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
                ->where('status', 'paid')
                ->where('type', SavingsTransaction::TYPE_WITHDRAW)
                ->whereBetween('occurred_at', [$from->toDateString(), $to->toDateString()])
                ->tap(fn (Builder $q) => $this->applyMemberScope($q))
                ->sum('amount');
        }

        return max(0.0, $deposits + $txDeposits - $withdrawals);
    }

    private function loansDisbursedInRange(Carbon $from, Carbon $to): float
    {
        return (float) Loan::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->whereBetween('issued_at', [$from->toDateString(), $to->toDateString()])
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('principal');
    }

    /**
     * @return array{0: float, 1: float}
     */
    private function financialTransactionTotals(Carbon $from, Carbon $to): array
    {
        if ($this->memberIds !== null) {
            return [0.0, 0.0];
        }

        $income = (float) FinancialTransaction::query()
            ->where('type', 'income')
            ->whereBetween('occurred_at', [$from->toDateString(), $to->toDateString()])
            ->whereHas('group', fn (Builder $g) => $g->where('company_id', $this->companyId))
            ->sum('amount');

        $expense = (float) FinancialTransaction::query()
            ->where('type', 'expense')
            ->whereBetween('occurred_at', [$from->toDateString(), $to->toDateString()])
            ->whereHas('group', fn (Builder $g) => $g->where('company_id', $this->companyId))
            ->sum('amount');

        return [$income, $expense];
    }

    private function applyMemberScope(Builder $query): void
    {
        if ($this->memberIds === null) {
            return;
        }
        if ($this->memberIds === []) {
            $query->whereRaw('1 = 0');

            return;
        }
        $query->whereIn('member_id', $this->memberIds);
    }

    private function fmt(float $value): string
    {
        return number_format($value, 2, '.', '');
    }

    /**
     * @return Collection<int, ChartOfAccount>
     */
    private function activeChartAccounts(): Collection
    {
        return ChartOfAccount::query()
            ->forCompany($this->companyId)
            ->where('is_active', true)
            ->orderBy('code')
            ->orderBy('name')
            ->get(['id', 'type', 'code', 'name']);
    }

    private function firstChartAccountLabel(ChartOfAccountType $type): ?string
    {
        /** @var ChartOfAccount|null $account */
        $account = $this->activeChartAccounts()
            ->first(fn (ChartOfAccount $a) => $a->type === $type);

        if ($account === null) {
            return null;
        }

        return trim($account->code.' — '.$account->name);
    }

    /**
     * @return array<string, array{debit: float, credit: float}>
     */
    private function journalSumsThroughByCode(Carbon $asOfEnd): array
    {
        if (! class_exists(JournalLine::class) || ! Schema::hasTable('journal_lines') || ! Schema::hasTable('journal_entries')) {
            return [];
        }

        $asOfStr = $asOfEnd->toDateString();

        $rows = JournalLine::query()
            ->selectRaw('chart_of_accounts.code as code, SUM(journal_lines.debit) as debit_sum, SUM(journal_lines.credit) as credit_sum')
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->join('chart_of_accounts', 'chart_of_accounts.id', '=', 'journal_lines.chart_of_account_id')
            ->where('journal_entries.company_id', $this->companyId)
            ->whereDate('journal_entries.occurred_at', '<=', $asOfStr)
            ->groupBy('chart_of_accounts.code')
            ->get();

        $out = [];
        foreach ($rows as $r) {
            $code = (string) ($r->code ?? '');
            if ($code === '') {
                continue;
            }
            $out[$code] = [
                'debit' => (float) ($r->debit_sum ?? 0),
                'credit' => (float) ($r->credit_sum ?? 0),
            ];
        }

        return $out;
    }

    /**
     * Net balance adjustments per balance-sheet code. For assets: debit-credit. For liabilities/capital: credit-debit.
     *
     * @return array<string, float>
     */
    private function journalNetThroughByCodeAndType(Carbon $asOfEnd): array
    {
        if (! class_exists(JournalLine::class) || ! Schema::hasTable('journal_lines') || ! Schema::hasTable('journal_entries')) {
            return [];
        }

        $asOfStr = $asOfEnd->toDateString();

        $rows = JournalLine::query()
            ->selectRaw('chart_of_accounts.code as code, chart_of_accounts.type as type, SUM(journal_lines.debit) as debit_sum, SUM(journal_lines.credit) as credit_sum')
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->join('chart_of_accounts', 'chart_of_accounts.id', '=', 'journal_lines.chart_of_account_id')
            ->where('journal_entries.company_id', $this->companyId)
            ->whereDate('journal_entries.occurred_at', '<=', $asOfStr)
            ->whereIn('chart_of_accounts.type', [
                ChartOfAccountType::Asset->value,
                ChartOfAccountType::Liability->value,
                ChartOfAccountType::Capital->value,
            ])
            ->groupBy('chart_of_accounts.code', 'chart_of_accounts.type')
            ->get();

        $out = [];
        foreach ($rows as $r) {
            $code = (string) ($r->code ?? '');
            $type = (string) ($r->type ?? '');
            if ($code === '' || $type === '') {
                continue;
            }
            $debit = (float) ($r->debit_sum ?? 0);
            $credit = (float) ($r->credit_sum ?? 0);
            $net = $type === ChartOfAccountType::Asset->value
                ? ($debit - $credit)
                : ($credit - $debit);
            if (abs($net) > 0.000001) {
                $out[$code] = ($out[$code] ?? 0.0) + $net;
            }
        }

        return $out;
    }

    /**
     * @return array{0: float, 1: float} income, expense
     */
    private function journalProfitLossTotals(Carbon $from, Carbon $to): array
    {
        if (! class_exists(JournalLine::class) || ! Schema::hasTable('journal_lines') || ! Schema::hasTable('journal_entries')) {
            return [0.0, 0.0];
        }
        if ($this->memberIds !== null) {
            return [0.0, 0.0];
        }

        $fromStr = $from->toDateString();
        $toStr = $to->toDateString();

        $rows = JournalLine::query()
            ->selectRaw('chart_of_accounts.type as type, SUM(journal_lines.debit) as debit_sum, SUM(journal_lines.credit) as credit_sum')
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->join('chart_of_accounts', 'chart_of_accounts.id', '=', 'journal_lines.chart_of_account_id')
            ->where('journal_entries.company_id', $this->companyId)
            ->whereBetween('journal_entries.occurred_at', [$fromStr, $toStr])
            ->whereIn('chart_of_accounts.type', [
                ChartOfAccountType::Income->value,
                ChartOfAccountType::Expense->value,
            ])
            ->groupBy('chart_of_accounts.type')
            ->get();

        $income = 0.0;
        $expense = 0.0;
        foreach ($rows as $r) {
            $type = (string) ($r->type ?? '');
            $debit = (float) ($r->debit_sum ?? 0);
            $credit = (float) ($r->credit_sum ?? 0);
            if ($type === ChartOfAccountType::Income->value) {
                $income += max(0.0, $credit - $debit);
            } elseif ($type === ChartOfAccountType::Expense->value) {
                $expense += max(0.0, $debit - $credit);
            }
        }

        return [$income, $expense];
    }

    private function savingsWithdrawnInRange(Carbon $from, Carbon $to): float
    {
        if (! Schema::hasTable('savings_transactions')) {
            return 0.0;
        }

        return (float) SavingsTransaction::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved->value)
            ->where('status', 'paid')
            ->where('type', SavingsTransaction::TYPE_WITHDRAW)
            ->whereBetween('occurred_at', [$from->toDateString(), $to->toDateString()])
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');
    }
}
