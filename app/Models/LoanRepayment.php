<?php

namespace App\Models;

use App\Enums\LoanStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanRepayment extends Model
{
    protected static function booted(): void
    {
        static::saved(function (LoanRepayment $repayment): void {
            $loan = $repayment->loan;
            if (! $loan || $loan->status !== LoanStatus::Active) {
                return;
            }
            $total = (float) $loan->repayments()->sum('amount');
            if ($total >= (float) $loan->principal) {
                $loan->update(['status' => LoanStatus::Closed]);
            }
        });
    }

    protected $fillable = [
        'loan_id',
        'amount',
        'paid_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date',
        ];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }
}
