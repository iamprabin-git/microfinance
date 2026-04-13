<?php

namespace App\Services\FinancialReporting;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Models\Company;
use App\Models\FinancialTransaction;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

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

        $rows = [];
        $rows[] = [
            'code' => '1100',
            'name' => 'Loans receivable (net of repayments)',
            'debit' => $this->fmt($loansOutstanding),
            'credit' => null,
        ];

        if ($cashPosition >= 0) {
            $rows[] = [
                'code' => '1010',
                'name' => 'Cash and bank (net of disbursements)',
                'debit' => $this->fmt($cashPosition),
                'credit' => null,
            ];
        } else {
            $rows[] = [
                'code' => '2015',
                'name' => 'Net funding from members (cash deficit)',
                'debit' => null,
                'credit' => $this->fmt(abs($cashPosition)),
            ];
        }

        $rows[] = [
            'code' => '2100',
            'name' => 'Member savings deposits held (paid contributions)',
            'debit' => null,
            'credit' => $this->fmt($savingsPayable),
        ];

        $totalDebit = $loansOutstanding + max(0, $cashPosition);
        $totalCredit = $savingsPayable + max(0, -$cashPosition);
        $plug = $totalDebit - $totalCredit;
        if ($plug > 0) {
            $rows[] = [
                'code' => '3900',
                'name' => "Members' equity / accumulated surplus (balancing)",
                'debit' => null,
                'credit' => $this->fmt($plug),
            ];
            $totalCredit += $plug;
        } elseif ($plug < 0) {
            $rows[] = [
                'code' => '3910',
                'name' => "Members' equity / accumulated deficit (balancing)",
                'debit' => $this->fmt(abs($plug)),
                'credit' => null,
            ];
            $totalDebit += abs($plug);
        }

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

        $assets = [
            ['label' => 'Loans receivable (net)', 'amount' => $this->fmt($loansOutstanding)],
        ];
        if ($cashPosition >= 0) {
            $assets[] = ['label' => 'Cash and bank (net)', 'amount' => $this->fmt($cashPosition)];
        }

        $liabilities = [
            ['label' => 'Member savings payable', 'amount' => $this->fmt($savingsPayable)],
        ];
        if ($cashPosition < 0) {
            $liabilities[] = ['label' => 'Net member funding (cash overdraft)', 'amount' => $this->fmt(abs($cashPosition))];
        }

        $equityRows = [
            ['label' => "Members' equity (net assets)", 'amount' => $this->fmt($equity)],
        ];

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
            $lines[] = [
                'label' => 'Other income (recorded transactions)',
                'amount' => $this->fmt($otherIncome),
                'kind' => 'income',
            ];
        }
        if ($otherExpense > 0) {
            $lines[] = [
                'label' => 'Operating expenses (recorded transactions)',
                'amount' => $this->fmt($otherExpense),
                'kind' => 'expense',
            ];
        }

        $net = $repayments + $savings - $disbursed + $otherIncome - $otherExpense;

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
        $savings = $this->savingsPaidInRange($fromDay, $toDay);
        $disbursed = $this->loansDisbursedInRange($fromDay, $toDay);
        $netPeriod = $repayments + $savings - $disbursed;
        $closing = $opening + $netPeriod;

        $lines = [
            ['label' => 'Loan repayments received', 'amount' => $this->fmt($repayments)],
            ['label' => 'Savings contributions received', 'amount' => $this->fmt($savings)],
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
            ->where('company_approval_status', '!=', CompanyApprovalStatus::Rejected)
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
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
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
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
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

        return (float) MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
            ->where('status', DepositStatus::Paid)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');
    }

    private function cashPositionThrough(Carbon $asOfEnd): float
    {
        $asOfStr = $asOfEnd->toDateString();

        $repayments = (float) LoanRepayment::query()
            ->whereHas('loan', function (Builder $q) use ($asOfStr): void {
                $q->forCompany($this->companyId)
                    ->where('company_approval_status', CompanyApprovalStatus::Approved)
                    ->whereDate('issued_at', '<=', $asOfStr);
                $this->applyMemberScope($q);
            })
            ->whereDate('paid_at', '<=', $asOfStr)
            ->sum('amount');

        $savings = (float) MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
            ->where('status', DepositStatus::Paid)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');

        $disbursed = (float) Loan::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
            ->whereDate('issued_at', '<=', $asOfStr)
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('principal');

        return $repayments + $savings - $disbursed;
    }

    private function repaymentsInRange(Carbon $from, Carbon $to): float
    {
        return (float) LoanRepayment::query()
            ->whereHas('loan', function (Builder $q): void {
                $q->forCompany($this->companyId)
                    ->where('company_approval_status', CompanyApprovalStatus::Approved);
                $this->applyMemberScope($q);
            })
            ->whereBetween('paid_at', [$from->toDateString(), $to->toDateString()])
            ->sum('amount');
    }

    private function savingsPaidInRange(Carbon $from, Carbon $to): float
    {
        return (float) MonthlyDeposit::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
            ->where('status', DepositStatus::Paid)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$from->toDateString(), $to->toDateString()])
            ->tap(fn (Builder $q) => $this->applyMemberScope($q))
            ->sum('amount');
    }

    private function loansDisbursedInRange(Carbon $from, Carbon $to): float
    {
        return (float) Loan::query()
            ->forCompany($this->companyId)
            ->where('company_approval_status', CompanyApprovalStatus::Approved)
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
}
