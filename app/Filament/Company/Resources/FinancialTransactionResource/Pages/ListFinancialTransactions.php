<?php

namespace App\Filament\Company\Resources\FinancialTransactionResource\Pages;

use App\Filament\Company\Resources\FinancialTransactionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFinancialTransactions extends ListRecords
{
    protected static string $resource = FinancialTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
