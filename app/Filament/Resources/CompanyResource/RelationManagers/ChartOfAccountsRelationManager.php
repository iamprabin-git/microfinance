<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ChartOfAccountsRelationManager extends RelationManager
{
    protected static string $relationship = 'chartOfAccounts';

    protected static ?string $title = 'Chart of accounts';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('type')
                    ->required()
                    ->options([
                        \App\Enums\ChartOfAccountType::Asset->value => \App\Enums\ChartOfAccountType::Asset->label(),
                        \App\Enums\ChartOfAccountType::Liability->value => \App\Enums\ChartOfAccountType::Liability->label(),
                        \App\Enums\ChartOfAccountType::Capital->value => \App\Enums\ChartOfAccountType::Capital->label(),
                        \App\Enums\ChartOfAccountType::Expense->value => \App\Enums\ChartOfAccountType::Expense->label(),
                        \App\Enums\ChartOfAccountType::Income->value => \App\Enums\ChartOfAccountType::Income->label(),
                    ]),
                Forms\Components\TextInput::make('code')
                    ->required()
                    ->maxLength(64),
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

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('type')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => \App\Enums\ChartOfAccountType::tryFrom($state)?->label() ?? $state),
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('description')
                    ->limit(50),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
