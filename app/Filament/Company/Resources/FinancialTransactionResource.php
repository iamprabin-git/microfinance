<?php

namespace App\Filament\Company\Resources;

use App\Filament\Company\Concerns\BelongsToTenantViaGroup;
use App\Filament\Company\Resources\FinancialTransactionResource\Pages;
use App\Filament\Company\TenantForm;
use App\Models\FinancialTransaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FinancialTransactionResource extends Resource
{
    use BelongsToTenantViaGroup;

    protected static ?string $model = FinancialTransaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrows-right-left';

    protected static ?string $navigationGroup = 'Ledger';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Income & expenses';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TenantForm::groupSelect(
                    Forms\Components\Select::make('group_id')->required()
                ),
                Forms\Components\Select::make('type')
                    ->options([
                        'income' => 'Income',
                        'expense' => 'Expense',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('category')
                    ->maxLength(255),
                Forms\Components\TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->minValue(0.01),
                Forms\Components\DatePicker::make('occurred_at')
                    ->required()
                    ->default(now()),
                Forms\Components\Textarea::make('description')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('group.name')
                    ->label('Group')
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge(),
                Tables\Columns\TextColumn::make('category')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('amount')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),
                Tables\Columns\TextColumn::make('occurred_at')
                    ->date()
                    ->sortable(),
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
            'index' => Pages\ListFinancialTransactions::route('/'),
            'create' => Pages\CreateFinancialTransaction::route('/create'),
            'edit' => Pages\EditFinancialTransaction::route('/{record}/edit'),
        ];
    }
}
