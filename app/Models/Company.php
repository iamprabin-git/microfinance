<?php

namespace App\Models;

use App\Enums\CompanyPaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'slug',
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
}
