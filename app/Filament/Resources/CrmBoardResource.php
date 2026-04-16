<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CrmBoardResource\Pages;
use App\Filament\Resources\CrmBoardResource\RelationManagers\ColumnsRelationManager;
use App\Filament\Resources\CrmBoardResource\RelationManagers\GroupsRelationManager;
use App\Filament\Resources\CrmBoardResource\RelationManagers\ItemsRelationManager;
use App\Models\CrmBoard;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CrmBoardResource extends Resource
{
    protected static ?string $model = CrmBoard::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-group';

    protected static ?string $navigationGroup = 'CRM';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->rows(3)
                    ->maxLength(2000),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
                Tables\Columns\TextColumn::make('columns_count')
                    ->counts('columns')
                    ->label('Columns'),
                Tables\Columns\TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Items'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            GroupsRelationManager::class,
            ColumnsRelationManager::class,
            ItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCrmBoards::route('/'),
            'create' => Pages\CreateCrmBoard::route('/create'),
            'edit' => Pages\EditCrmBoard::route('/{record}/edit'),
            'kanban' => Pages\KanbanCrmBoard::route('/{record}/kanban'),
        ];
    }
}

