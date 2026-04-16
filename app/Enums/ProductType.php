<?php

namespace App\Enums;

enum ProductType: string
{
    case Savings = 'savings';
    case Loan = 'loan';

    public function label(): string
    {
        return match ($this) {
            self::Savings => 'Savings',
            self::Loan => 'Loan',
        };
    }
}

