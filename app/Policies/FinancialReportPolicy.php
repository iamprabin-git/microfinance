<?php

namespace App\Policies;

use App\Models\User;

class FinancialReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->belongsToCompanyWebPortal();
    }
}
