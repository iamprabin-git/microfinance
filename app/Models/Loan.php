<?php

namespace App\Models;

use App\Enums\CompanyApprovalStatus;
use App\Enums\LoanStatus;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'member_id',
        'principal',
        'issued_at',
        'due_date',
        'status',
        'notes',
        'company_approval_status',
    ];

    protected function casts(): array
    {
        return [
            'principal' => 'decimal:2',
            'issued_at' => 'date',
            'due_date' => 'date',
            'status' => LoanStatus::class,
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

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }
}
