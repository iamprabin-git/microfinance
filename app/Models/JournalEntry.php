<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'member_id',
        'loan_id',
        'occurred_at',
        'reference',
        'memo',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'date',
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

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }
}

