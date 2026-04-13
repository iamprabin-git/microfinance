<?php

namespace App\Policies;

use App\Enums\CompanyApprovalStatus;
use App\Enums\LoanStatus;
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
        if (! $this->companyMatches($user, (int) $loan->company_id)) {
            return false;
        }

        if ($user->isCompanyEndUser()) {
            $loan->loadMissing('member');

            return $user->memberEmailMatches($loan->member?->email);
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $user->canManageCompanyOperationalData();
    }

    public function update(User $user, Loan $loan): bool
    {
        if (! $this->companyMatches($user, (int) $loan->company_id)) {
            return false;
        }

        return $user->canManageCompanyOperationalData();
    }

    public function delete(User $user, Loan $loan): bool
    {
        if (! $this->companyMatches($user, (int) $loan->company_id)) {
            return false;
        }

        return $user->canManageCompanyOperationalData();
    }

    /**
     * Record a repayment against a loan (company portal).
     */
    public function repay(User $user, Loan $loan): bool
    {
        if (! $this->companyMatches($user, (int) $loan->company_id)) {
            return false;
        }

        if ($loan->company_approval_status !== CompanyApprovalStatus::Approved) {
            return false;
        }

        if ($loan->status !== LoanStatus::Active) {
            return false;
        }

        return $user->isCompanyAdmin() || $user->isCompanyStaff();
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
