<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalVoucherLine extends Model
{
    use HasFactory;

    public const SIDE_DEBIT = 'debit';

    public const SIDE_CREDIT = 'credit';

    protected $fillable = [
        'journal_voucher_id',
        'side',
        'chart_of_account_id',
        'amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(JournalVoucher::class, 'journal_voucher_id');
    }

    public function chartOfAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'chart_of_account_id');
    }
}
