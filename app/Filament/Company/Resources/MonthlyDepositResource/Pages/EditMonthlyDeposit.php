<?php

namespace App\Filament\Company\Resources\MonthlyDepositResource\Pages;

use App\Filament\Company\Resources\MonthlyDepositResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMonthlyDeposit extends EditRecord
{
    protected static string $resource = MonthlyDepositResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
