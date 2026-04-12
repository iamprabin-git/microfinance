<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'group_id',
        'name',
        'email',
        'phone',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function monthlyDeposits(): HasMany
    {
        return $this->hasMany(MonthlyDeposit::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}
