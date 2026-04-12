<?php

namespace App\Models;

use App\Enums\LoanStatus;
use App\Models\Concerns\BelongsToCompanyViaGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use BelongsToCompanyViaGroup;

    protected $fillable = [
        'group_id',
        'member_id',
        'principal',
        'issued_at',
        'due_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'principal' => 'decimal:2',
            'issued_at' => 'date',
            'due_date' => 'date',
            'status' => LoanStatus::class,
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

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }
}
