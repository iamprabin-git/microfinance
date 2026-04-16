<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChartOfAccount extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'type',
        'code',
        'name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => \App\Enums\ChartOfAccountType::class,
            'is_active' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
