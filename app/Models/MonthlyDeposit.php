<?php

namespace App\Models;

use App\Enums\DepositStatus;
use App\Models\Concerns\BelongsToCompanyViaGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyDeposit extends Model
{
    use BelongsToCompanyViaGroup;

    protected $fillable = [
        'group_id',
        'member_id',
        'period',
        'amount',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'period' => 'date',
            'amount' => 'decimal:2',
            'paid_at' => 'date',
            'status' => DepositStatus::class,
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
