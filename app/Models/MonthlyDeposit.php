<?php

namespace App\Models;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyDeposit extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'member_id',
        'period',
        'amount',
        'status',
        'paid_at',
        'company_approval_status',
    ];

    protected function casts(): array
    {
        return [
            'period' => 'date',
            'amount' => 'decimal:2',
            'paid_at' => 'date',
            'status' => DepositStatus::class,
            'company_approval_status' => CompanyApprovalStatus::class,
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
