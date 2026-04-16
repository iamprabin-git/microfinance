<?php

namespace App\Filament\Resources\CrmBoardResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class GroupsRelationManager extends RelationManager
{
    protected static string $relationship = 'groups';

    protected static ?string $title = 'Groups';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),
            Forms\Components\TextInput::make('position')
                ->numeric()
                ->minValue(0)
                ->default(0),
            Forms\Components\Toggle::make('is_collapsed')
                ->default(false),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('position')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_collapsed')
                    ->boolean()
                    ->label('Collapsed'),
                Tables\Columns\TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Items'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('position');
    }
}

