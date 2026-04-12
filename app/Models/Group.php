<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'description',
        'monthly_contribution_amount',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'monthly_contribution_amount' => 'decimal:2',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function monthlyDeposits(): HasMany
    {
        return $this->hasMany(MonthlyDeposit::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }
}
