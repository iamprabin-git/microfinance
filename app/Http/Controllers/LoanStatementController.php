<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Models\Loan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanStatementController extends Controller
{
    public function __invoke(Request $request, Loan $loan): Response
    {
        $this->authorize('view', $loan);

        $loan->loadMissing([
            'company:id,name,currency',
            'member:id,name,member_number,savings_account_number',
            'repayments' => fn ($q) => $q->orderBy('paid_at'),
        ]);

        $company = $loan->company;

        $transactions = [];
        $transactions[] = [
            'date' => $loan->issued_at?->toDateString(),
            'type' => 'Disbursement',
            'reference' => $loan->loan_account_number,
            'debit' => (string) $loan->principal,
            'credit' => null,
            'notes' => $loan->notes,
        ];
        foreach ($loan->repayments as $r) {
            $transactions[] = [
                'date' => $r->paid_at?->toDateString(),
                'type' => 'Repayment',
                'reference' => null,
                'debit' => null,
                'credit' => (string) $r->amount,
                'notes' => $r->notes,
            ];
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('journal_entries')) {
            $journal = JournalEntry::query()
                ->forCompany((int) $loan->company_id)
                ->where('loan_id', $loan->id)
                ->with(['lines'])
                ->orderBy('occurred_at')
                ->get();

            foreach ($journal as $e) {
                $debit = (float) $e->lines->sum('debit');
                $credit = (float) $e->lines->sum('credit');
                $transactions[] = [
                    'date' => $e->occurred_at?->toDateString(),
                    'type' => 'Adjustment',
                    'reference' => $e->reference ?? ('JE-'.$e->id),
                    'debit' => $debit > 0.000001 ? number_format($debit, 2, '.', '') : null,
                    'credit' => $credit > 0.000001 ? number_format($credit, 2, '.', '') : null,
                    'notes' => $e->memo,
                ];
            }
        }

        usort($transactions, fn ($a, $b) => strcmp((string) $a['date'], (string) $b['date']));

        return Inertia::render('Loans/Statement', [
            'company' => $company?->only(['name', 'currency']),
            'loan' => [
                'id' => $loan->id,
                'loan_account_number' => $loan->loan_account_number,
                'issued_at' => $loan->issued_at?->toDateString(),
                'due_date' => $loan->due_date?->toDateString(),
                'principal' => (string) $loan->principal,
                'status' => $loan->status->value,
                'company_approval_status' => $loan->company_approval_status->value,
                'member' => [
                    'id' => $loan->member?->id,
                    'name' => $loan->member?->name ?? '—',
                    'member_number' => $loan->member?->member_number,
                    'savings_account_number' => $loan->member?->savings_account_number,
                ],
            ],
            'transactions' => $transactions,
        ]);
    }
}

