<?php

namespace App\Models;

use App\Enums\CompanyPaymentStatus;
use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'currency',
        'address',
        'contact_phone',
        'contact_email',
        'pan_vat_number',
        'registration_number',
        'website',
        'logo_path',
        'is_active',
        'notes',
        'payment_status',
        'payment_receipt_notes',
        'payment_reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'payment_status' => CompanyPaymentStatus::class,
            'payment_reviewed_at' => 'datetime',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function monthlyDeposits(): HasMany
    {
        return $this->hasMany(MonthlyDeposit::class);
    }

    public function chartOfAccounts(): HasMany
    {
        return $this->hasMany(ChartOfAccount::class);
    }
}
