<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ChartOfAccountResource\Pages;
use App\Models\ChartOfAccount;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ChartOfAccountResource extends Resource
{
    protected static ?string $model = ChartOfAccount::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->label('Company')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
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

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Company')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active status'),
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListChartOfAccounts::route('/'),
            'create' => Pages\CreateChartOfAccount::route('/create'),
            'edit' => Pages\EditChartOfAccount::route('/{record}/edit'),
        ];
    }
}
