<?php

namespace App\Enums;

enum CompanyApprovalStatus: string
{
    case Approved = 'approved';
    case PendingApproval = 'pending_approval';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Approved => 'Approved',
            self::PendingApproval => 'Pending company approval',
            self::Rejected => 'Rejected',
        };
    }
}
