<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\MonthlyDeposit;
use App\Models\User;

class MonthlyDepositPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->inCompanyPortal($user);
    }

    public function view(User $user, MonthlyDeposit $monthlyDeposit): bool
    {
        return $this->companyMatches($user, $monthlyDeposit->group->company_id);
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::CompanyAdmin && $user->company_id !== null;
    }

    public function update(User $user, MonthlyDeposit $monthlyDeposit): bool
    {
        return $user->role === UserRole::CompanyAdmin
            && $this->companyMatches($user, $monthlyDeposit->group->company_id);
    }

    public function delete(User $user, MonthlyDeposit $monthlyDeposit): bool
    {
        return $user->role === UserRole::CompanyAdmin
            && $this->companyMatches($user, $monthlyDeposit->group->company_id);
    }

    private function inCompanyPortal(User $user): bool
    {
        return in_array($user->role, [UserRole::CompanyAdmin, UserRole::CompanyUser], true)
            && $user->company_id !== null;
    }

    private function companyMatches(User $user, int $companyId): bool
    {
        return $user->company_id === $companyId;
    }
}
