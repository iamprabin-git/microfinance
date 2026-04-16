<?php

namespace App\Filament\Resources\CrmBoardResource\Pages;

use App\Filament\Resources\CrmBoardResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCrmBoard extends EditRecord
{
    protected static string $resource = CrmBoardResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('kanban')
                ->label('Kanban')
                ->icon('heroicon-o-view-columns')
                ->url(fn (): string => CrmBoardResource::getUrl('kanban', ['record' => $this->record])),
            Actions\DeleteAction::make(),
        ];
    }
}

