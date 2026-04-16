<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CrmItemActivityResource\Pages;
use App\Models\CrmItemActivity;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CrmItemActivityResource extends Resource
{
    protected static ?string $model = CrmItemActivity::class;

    protected static ?string $navigationIcon = 'heroicon-o-clock';

    protected static ?string $navigationGroup = 'CRM';

    protected static ?int $navigationSort = 50;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->since()
                    ->label('When')
                    ->sortable(),
                Tables\Columns\TextColumn::make('board.name')
                    ->label('Board')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('item.name')
                    ->label('Item')
                    ->searchable()
                    ->wrap(),
                Tables\Columns\TextColumn::make('event')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('actor.name')
                    ->label('Actor')
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('event')
                    ->options([
                        'created' => 'Created',
                        'updated' => 'Updated',
                        'status_changed' => 'Status changed',
                        'assigned' => 'Assigned',
                        'moved_group' => 'Moved group',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCrmItemActivities::route('/'),
            'view' => Pages\ViewCrmItemActivity::route('/{record}'),
        ];
    }
}

