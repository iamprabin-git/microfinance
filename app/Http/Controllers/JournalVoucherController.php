<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use App\Models\JournalVoucher;
use App\Models\JournalVoucherLine;
use App\Support\Accounting\ChartOfAccountOptionBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JournalVoucherController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        $companyId = (int) $request->user()->company_id;

        $rows = JournalVoucher::query()
            ->forCompany($companyId)
            ->with([
                'lines.chartOfAccount:id,code,name,type',
            ])
            ->orderByDesc('voucher_date')
            ->orderByDesc('id')
            ->limit(200)
            ->get([
                'id',
                'voucher_date',
                'voucher_number',
                'title',
                'description',
                'dr_amount',
                'cr_amount',
                'remarks',
            ])
            ->map(function (JournalVoucher $v): array {
                $drLines = $v->lines->where('side', JournalVoucherLine::SIDE_DEBIT)->values();
                $crLines = $v->lines->where('side', JournalVoucherLine::SIDE_CREDIT)->values();

                $mapLine = function ($line): array {
                    /** @var \App\Models\JournalVoucherLine $line */
                    $a = $line->chartOfAccount;

                    return [
                        'id' => (int) ($a?->id ?? 0),
                        'label' => $a ? ChartOfAccountOptionBuilder::option($a)['label'] : '—',
                        'amount' => number_format((float) $line->amount, 2, '.', ''),
                    ];
                };

                return [
                    'id' => $v->id,
                    'voucher_date' => $v->voucher_date?->toDateString(),
                    'voucher_number' => $v->voucher_number,
                    'title' => $v->title,
                    'description' => $v->description,
                    'dr_accounts' => $drLines->map($mapLine)->all(),
                    'cr_accounts' => $crLines->map($mapLine)->all(),
                    'dr_amount' => number_format((float) $v->dr_amount, 2, '.', ''),
                    'cr_amount' => number_format((float) $v->cr_amount, 2, '.', ''),
                    'remarks' => $v->remarks,
                ];
            })
            ->all();

        return Inertia::render('JournalVouchers/Index', [
            'vouchers' => $rows,
            'can_create' => (bool) $request->user()?->canManageCompanyOperationalData(),
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        $companyId = (int) $request->user()->company_id;
        $accounts = ChartOfAccount::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->orderBy('type')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type'])
            ->map(fn (ChartOfAccount $a) => ChartOfAccountOptionBuilder::option($a))
            ->all();

        return Inertia::render('JournalVouchers/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'voucher_date' => ['required', 'date'],
            'voucher_number' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('journal_vouchers', 'voucher_number')
                    ->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'remarks' => ['nullable', 'string', 'max:255'],
            'lines' => ['required', 'array', 'min:2', 'max:40'],
            'lines.*.side' => ['required', 'string', Rule::in([JournalVoucherLine::SIDE_DEBIT, JournalVoucherLine::SIDE_CREDIT])],
            'lines.*.chart_of_account_id' => [
                'required',
                'integer',
                ValidationRule::exists('chart_of_accounts', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'lines.*.amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $lines = collect($validated['lines'])
            ->map(function (array $l): array {
                return [
                    'side' => (string) $l['side'],
                    'chart_of_account_id' => (int) $l['chart_of_account_id'],
                    'amount' => (float) $l['amount'],
                ];
            })
            ->values();

        $debits = $lines->where('side', JournalVoucherLine::SIDE_DEBIT);
        $credits = $lines->where('side', JournalVoucherLine::SIDE_CREDIT);

        if ($debits->count() < 1 || $credits->count() < 1) {
            return back()->withErrors(['lines' => 'Add at least one debit line and one credit line.']);
        }

        $totalDebit = (float) $debits->sum('amount');
        $totalCredit = (float) $credits->sum('amount');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return back()->withErrors(['lines' => 'Total debits must equal total credits.']);
        }

        DB::transaction(function () use ($companyId, $validated, $lines, $totalDebit, $totalCredit): void {
            $voucher = JournalVoucher::query()->create([
                'company_id' => $companyId,
                'voucher_date' => $validated['voucher_date'],
                'voucher_number' => $validated['voucher_number'] ?? null,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                // Legacy single-line fields (kept for compatibility / quick reporting).
                'dr_chart_of_account_id' => null,
                'cr_chart_of_account_id' => null,
                'dr_amount' => $totalDebit,
                'cr_amount' => $totalCredit,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            foreach ($lines as $l) {
                JournalVoucherLine::query()->create([
                    'journal_voucher_id' => $voucher->id,
                    'side' => $l['side'],
                    'chart_of_account_id' => $l['chart_of_account_id'],
                    'amount' => $l['amount'],
                ]);
            }
        });

        return redirect()
            ->route('journal-vouchers.index')
            ->with('status', 'Journal voucher saved.');
    }
}

