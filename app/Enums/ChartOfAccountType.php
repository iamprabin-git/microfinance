<?php

namespace App\Enums;

enum ChartOfAccountType: string
{
    case Asset = 'asset';
    case Liability = 'liability';
    case Capital = 'capital';
    case Expense = 'expense';
    case Income = 'income';

    public function label(): string
    {
        return match ($this) {
            self::Asset => 'Asset',
            self::Liability => 'Liability',
            self::Capital => 'Capital',
            self::Expense => 'Expense',
            self::Income => 'Income',
        };
    }
}
