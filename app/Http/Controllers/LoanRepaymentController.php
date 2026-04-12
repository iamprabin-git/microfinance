<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LoanRepaymentController extends Controller
{
    public function store(Request $request, Loan $loan): RedirectResponse
    {
        $this->authorize('repay', $loan);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        LoanRepayment::query()->create([
            'loan_id' => $loan->id,
            'amount' => $validated['amount'],
            'paid_at' => $validated['paid_at'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()
            ->route('loans.edit', $loan)
            ->with('status', 'Repayment recorded.');
    }
}
