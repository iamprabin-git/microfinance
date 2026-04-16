<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\Loan;
use App\Models\Member;
use App\Support\Accounting\ChartOfAccountOptionBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JournalEntryController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        if (! Schema::hasTable('journal_entries') || ! Schema::hasTable('journal_lines')) {
            return Inertia::render('JournalEntries/Index', [
                'entries' => [],
                'can_post' => false,
                'missing_tables' => true,
            ]);
        }

        $companyId = (int) $request->user()->company_id;

        $entries = JournalEntry::query()
            ->forCompany($companyId)
            ->with([
                'member:id,name,member_number,savings_account_number',
                'loan:id,loan_account_number,member_id',
                'lines.chartOfAccount:id,code,name',
            ])
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(function (JournalEntry $e): array {
                $debit = (float) $e->lines->sum('debit');
                $credit = (float) $e->lines->sum('credit');

                return [
                    'id' => $e->id,
                    'occurred_at' => $e->occurred_at?->toDateString(),
                    'reference' => $e->reference,
                    'memo' => $e->memo,
                    'member' => $e->member ? [
                        'id' => $e->member->id,
                        'name' => $e->member->name,
                        'member_number' => $e->member->member_number,
                        'savings_account_number' => $e->member->savings_account_number,
                    ] : null,
                    'loan' => $e->loan ? [
                        'id' => $e->loan->id,
                        'loan_account_number' => $e->loan->loan_account_number,
                    ] : null,
                    'total_debit' => number_format($debit, 2, '.', ''),
                    'total_credit' => number_format($credit, 2, '.', ''),
                    'lines' => $e->lines->map(fn ($l) => [
                        'id' => $l->id,
                        'account' => $l->chartOfAccount
                            ? trim($l->chartOfAccount->code.' — '.$l->chartOfAccount->name)
                            : '—',
                        'debit' => (string) $l->debit,
                        'credit' => (string) $l->credit,
                        'description' => $l->description,
                    ])->all(),
                ];
            });

        return Inertia::render('JournalEntries/Index', [
            'entries' => $entries,
            'can_post' => (bool) $request->user()?->isCompanyAdmin(),
            'missing_tables' => false,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->isCompanyAdmin(), 403);

        $companyId = (int) $request->user()->company_id;
        $accounts = ChartOfAccount::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->orderBy('type')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type'])
            ->map(fn (ChartOfAccount $a) => ChartOfAccountOptionBuilder::option($a))
            ->all();

        $members = Member::query()
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

        $loans = Loan::query()
            ->forCompany($companyId)
            ->with(['member:id,name'])
            ->orderByDesc('issued_at')
            ->limit(500)
            ->get(['id', 'member_id', 'loan_account_number', 'issued_at', 'principal'])
            ->map(fn (Loan $l) => [
                'id' => $l->id,
                'loan_account_number' => $l->loan_account_number,
                'issued_at' => $l->issued_at?->toDateString(),
                'principal' => (string) $l->principal,
                'member' => [
                    'id' => $l->member?->id,
                    'name' => $l->member?->name ?? '—',
                ],
            ])
            ->all();

        return Inertia::render('JournalEntries/Create', [
            'accounts' => $accounts,
            'members' => $members,
            'loans' => $loans,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->isCompanyAdmin(), 403);

        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'occurred_at' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:128'],
            'memo' => ['nullable', 'string', 'max:2000'],
            'member_id' => [
                'nullable',
                'integer',
                Rule::exists('members', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'loan_id' => [
                'nullable',
                'integer',
                Rule::exists('loans', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'lines' => ['required', 'array', 'min:2', 'max:10'],
            'lines.*.chart_of_account_id' => [
                'required',
                'integer',
                Rule::exists('chart_of_accounts', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'lines.*.debit' => ['nullable', 'numeric', 'min:0'],
            'lines.*.credit' => ['nullable', 'numeric', 'min:0'],
            'lines.*.description' => ['nullable', 'string', 'max:255'],
        ]);

        $lines = collect($validated['lines'])
            ->map(function (array $l): array {
                $debit = (float) ($l['debit'] ?? 0);
                $credit = (float) ($l['credit'] ?? 0);

                return [
                    'chart_of_account_id' => (int) $l['chart_of_account_id'],
                    'debit' => $debit,
                    'credit' => $credit,
                    'description' => $l['description'] ?? null,
                ];
            })
            ->filter(fn (array $l) => $l['debit'] > 0.000001 || $l['credit'] > 0.000001)
            ->values();

        if ($lines->count() < 2) {
            return back()->withErrors(['lines' => 'Add at least two non-zero lines.']);
        }

        $totalDebit = (float) $lines->sum('debit');
        $totalCredit = (float) $lines->sum('credit');
        if (abs($totalDebit - $totalCredit) > 0.01) {
            return back()->withErrors(['lines' => 'Total debits must equal total credits.']);
        }

        $entry = JournalEntry::query()->create([
            'company_id' => $companyId,
            'member_id' => $validated['member_id'] ?? null,
            'loan_id' => $validated['loan_id'] ?? null,
            'occurred_at' => $validated['occurred_at'],
            'reference' => $validated['reference'] ?? null,
            'memo' => $validated['memo'] ?? null,
        ]);

        $entry->lines()->createMany($lines->all());

        return redirect()
            ->route('journal-entries.index')
            ->with('status', 'Journal entry posted.');
    }
}

