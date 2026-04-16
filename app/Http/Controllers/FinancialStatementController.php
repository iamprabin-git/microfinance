<?php

namespace App\Http\Controllers;

use App\Domain\FinancialReport;
use App\Services\FinancialReporting\FinancialReportsBuilder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FinancialStatementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', FinancialReport::class);

        $validated = $request->validate([
            'report' => ['nullable', 'string', 'in:trial-balance,profit-and-loss,balance-sheet,cash-flow,savings-register,loans-register'],
            'as_of' => ['nullable', 'date'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $report = $validated['report'] ?? 'trial-balance';

        $asOf = isset($validated['as_of'])
            ? Carbon::parse($validated['as_of'])
            : Carbon::now();

        $from = isset($validated['from'])
            ? Carbon::parse($validated['from'])->startOfDay()
            : Carbon::now()->copy()->startOfMonth()->startOfDay();

        $to = isset($validated['to'])
            ? Carbon::parse($validated['to'])->endOfDay()
            : Carbon::now()->copy()->endOfMonth()->endOfDay();

        $builder = FinancialReportsBuilder::forUser($request->user());
        $company = $request->user()?->company;
        $logoUrl = ($company !== null && filled($company->logo_path))
            ? Storage::disk('public')->url((string) $company->logo_path)
            : null;

        $payload = match ($report) {
            'trial-balance' => $builder->trialBalance($asOf),
            'balance-sheet' => $builder->balanceSheet($asOf),
            'profit-and-loss' => $builder->profitAndLoss($from, $to),
            'cash-flow' => $builder->cashFlow($from, $to),
            'savings-register' => $builder->savingsRegister($from, $to),
            'loans-register' => $builder->loansRegister($from, $to),
        };

        return Inertia::render('FinancialStatements/Index', [
            'report' => $report,
            'as_of' => $asOf->toDateString(),
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'currency' => $builder->currency(),
            'company' => $company?->only([
                'name',
                'address',
                'contact_phone',
                'contact_email',
                'pan_vat_number',
                'registration_number',
                'website',
            ]),
            'company_logo_url' => $logoUrl,
            'disclaimer' => 'Statement totals use company-approved loans and paid savings only; rejected rows are excluded. The savings register may list pending contributions for tracking (they do not add to totals until approved and paid). Staff edits that change amounts, dates, members, or status send a record back for company approval. This is illustrative management reporting, not audited GAAP statements.',
            'trial_balance' => $report === 'trial-balance' ? $payload : null,
            'balance_sheet' => $report === 'balance-sheet' ? $payload : null,
            'profit_and_loss' => $report === 'profit-and-loss' ? $payload : null,
            'cash_flow' => $report === 'cash-flow' ? $payload : null,
            'savings_register' => $report === 'savings-register' ? $payload : null,
            'loans_register' => $report === 'loans-register' ? $payload : null,
        ]);
    }
}
