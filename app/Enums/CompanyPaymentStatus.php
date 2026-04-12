<?php

namespace App\Enums;

enum CompanyPaymentStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending receipt review',
            self::Approved => 'Approved (payment verified)',
            self::Rejected => 'Rejected / unpaid',
        };
    }
}
