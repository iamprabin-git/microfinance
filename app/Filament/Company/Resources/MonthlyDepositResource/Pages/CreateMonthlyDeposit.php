<?php

namespace App\Filament\Company\Resources\MonthlyDepositResource\Pages;

use App\Filament\Company\Resources\MonthlyDepositResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMonthlyDeposit extends CreateRecord
{
    protected static string $resource = MonthlyDepositResource::class;
}
