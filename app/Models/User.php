<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'company_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return match ($panel->getId()) {
            'admin' => $this->role === UserRole::SuperAdmin,
            default => false,
        };
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    public function isCompanyAdmin(): bool
    {
        return $this->role === UserRole::CompanyAdmin && $this->company_id !== null;
    }

    public function isCompanyStaff(): bool
    {
        return $this->role === UserRole::CompanyStaff && $this->company_id !== null;
    }

    public function isCompanyEndUser(): bool
    {
        return $this->role === UserRole::CompanyEndUser && $this->company_id !== null;
    }

    /**
     * Staff or admin: can maintain members, loans, and savings in the portal.
     */
    public function canManageCompanyOperationalData(): bool
    {
        return $this->isCompanyAdmin() || $this->isCompanyStaff();
    }

    public function canApproveCompanyPortalRecords(): bool
    {
        return $this->isCompanyAdmin();
    }

    /**
     * Any company-scoped portal role (including read-only and end users).
     *
     * @return list<UserRole>
     */
    public static function companyWebRoles(): array
    {
        return [
            UserRole::CompanyAdmin,
            UserRole::CompanyUser,
            UserRole::CompanyStaff,
            UserRole::CompanyEndUser,
        ];
    }

    public function belongsToCompanyWebPortal(): bool
    {
        return $this->company_id !== null
            && in_array($this->role, self::companyWebRoles(), true);
    }

    public function memberEmailMatches(?string $memberEmail): bool
    {
        if ($memberEmail === null || $memberEmail === '') {
            return false;
        }

        return strcasecmp(trim($memberEmail), trim($this->email)) === 0;
    }
}
