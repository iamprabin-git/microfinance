<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone',
        'address',
        'profile_photo_path',
    ];

    protected function casts(): array
    {
        return [
            'member_number' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Member $member): void {
            if ($member->member_number !== null) {
                return;
            }
            $next = (int) static::query()
                ->where('company_id', $member->company_id)
                ->max('member_number');
            $member->member_number = $next + 1;
        });
    }

    public function profilePhotoPublicUrl(): ?string
    {
        if ($this->profile_photo_path === null || $this->profile_photo_path === '') {
            return null;
        }

        return asset('storage/'.$this->profile_photo_path);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
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
