<?php

namespace App\Filament\Company\Resources\FinancialTransactionResource\Pages;

use App\Filament\Company\Resources\FinancialTransactionResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateFinancialTransaction extends CreateRecord
{
    protected static string $resource = FinancialTransactionResource::class;
}
