<?php

namespace App\Policies;

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
        if (! $this->companyMatches($user, (int) $monthlyDeposit->company_id)) {
            return false;
        }

        if ($user->isCompanyEndUser()) {
            $monthlyDeposit->loadMissing('member');

            return $user->memberEmailMatches($monthlyDeposit->member?->email);
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $user->canManageCompanyOperationalData();
    }

    public function update(User $user, MonthlyDeposit $monthlyDeposit): bool
    {
        if (! $this->companyMatches($user, (int) $monthlyDeposit->company_id)) {
            return false;
        }

        return $user->canManageCompanyOperationalData();
    }

    public function delete(User $user, MonthlyDeposit $monthlyDeposit): bool
    {
        if (! $this->companyMatches($user, (int) $monthlyDeposit->company_id)) {
            return false;
        }

        return $user->canManageCompanyOperationalData();
    }

    private function inCompanyPortal(User $user): bool
    {
        return $user->belongsToCompanyWebPortal();
    }

    private function companyMatches(User $user, int $companyId): bool
    {
        return $user->company_id === $companyId;
    }
}
