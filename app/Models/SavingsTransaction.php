<?php

namespace App\Models;

use App\Enums\CompanyApprovalStatus;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingsTransaction extends Model
{
    use BelongsToCompany;

    public const TYPE_DEPOSIT = 'deposit';
    public const TYPE_WITHDRAW = 'withdraw';

    protected $fillable = [
        'company_id',
        'member_id',
        'type',
        'amount',
        'occurred_at',
        'status',
        'company_approval_status',
        'reference',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'occurred_at' => 'date',
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

