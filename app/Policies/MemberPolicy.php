<?php

namespace App\Policies;

use App\Models\Member;
use App\Models\User;

class MemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->belongsToCompanyWebPortal();
    }

    public function view(User $user, Member $member): bool
    {
        if (! $this->companyMatches($user, (int) $member->company_id)) {
            return false;
        }

        if ($user->isCompanyEndUser()) {
            return $user->memberEmailMatches($member->email);
        }

        return $user->belongsToCompanyWebPortal();
    }

    public function create(User $user): bool
    {
        return $user->canManageCompanyOperationalData();
    }

    public function update(User $user, Member $member): bool
    {
        return $user->canManageCompanyOperationalData()
            && $this->companyMatches($user, (int) $member->company_id);
    }

    public function delete(User $user, Member $member): bool
    {
        return $user->canManageCompanyOperationalData()
            && $this->companyMatches($user, (int) $member->company_id);
    }

    /**
     * Create a portal end user tied to this member (same email as member).
     */
    public function inviteEndUser(User $user, Member $member): bool
    {
        return $user->isCompanyAdmin()
            && $this->companyMatches($user, (int) $member->company_id)
            && filled($member->email);
    }

    private function companyMatches(User $user, int $companyId): bool
    {
        return $user->company_id === $companyId;
    }
}
