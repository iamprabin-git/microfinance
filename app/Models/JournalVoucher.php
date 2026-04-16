<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalVoucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'voucher_date',
        'voucher_number',
        'title',
        'description',
        'dr_chart_of_account_id',
        'cr_chart_of_account_id',
        'dr_amount',
        'cr_amount',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'voucher_date' => 'date',
            'dr_amount' => 'decimal:2',
            'cr_amount' => 'decimal:2',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function drAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'dr_chart_of_account_id');
    }

    public function crAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'cr_chart_of_account_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalVoucherLine::class, 'journal_voucher_id')->orderBy('id');
    }

    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }
}

