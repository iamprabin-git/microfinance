<?php

namespace App\Filament\Resources\CrmBoardResource\Pages;

use App\Filament\Resources\CrmBoardResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCrmBoards extends ListRecords
{
    protected static string $resource = CrmBoardResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}

