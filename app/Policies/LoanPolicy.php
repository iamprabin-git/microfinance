<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Loan;
use App\Models\User;

class LoanPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->inCompanyPortal($user);
    }

    public function view(User $user, Loan $loan): bool
    {
        return $this->companyMatches($user, $loan->group->company_id);
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::CompanyAdmin && $user->company_id !== null;
    }

    public function update(User $user, Loan $loan): bool
    {
        return $user->role === UserRole::CompanyAdmin
            && $this->companyMatches($user, $loan->group->company_id);
    }

    public function delete(User $user, Loan $loan): bool
    {
        return $user->role === UserRole::CompanyAdmin
            && $this->companyMatches($user, $loan->group->company_id);
    }

    /**
     * Record a repayment against a loan (company portal).
     */
    public function repay(User $user, Loan $loan): bool
    {
        return $user->role === UserRole::CompanyAdmin
            && $this->companyMatches($user, $loan->group->company_id);
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
