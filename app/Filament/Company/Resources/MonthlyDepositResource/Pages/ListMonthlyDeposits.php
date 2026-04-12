<?php

namespace App\Filament\Company\Resources\MonthlyDepositResource\Pages;

use App\Filament\Company\Resources\MonthlyDepositResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMonthlyDeposits extends ListRecords
{
    protected static string $resource = MonthlyDepositResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
