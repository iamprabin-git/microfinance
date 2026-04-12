<?php

namespace App\Filament\Company\Resources;

use App\Filament\Company\Concerns\BelongsToTenantViaGroup;
use App\Filament\Company\Resources\MonthlyDepositResource\Pages;
use App\Filament\Company\TenantForm;
use App\Models\MonthlyDeposit;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class MonthlyDepositResource extends Resource
{
    use BelongsToTenantViaGroup;

    protected static ?string $model = MonthlyDeposit::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Savings & loans';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Monthly deposits';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TenantForm::groupSelect(
                    Forms\Components\Select::make('group_id')
                        ->required()
                        ->live()
                ),
                Forms\Components\Select::make('member_id')
                    ->relationship(
                        'member',
                        'name',
                        fn (Builder $query, Get $get) => $query->where('group_id', $get('group_id')),
                    )
                    ->required()
                    ->disabled(fn (Get $get): bool => ! filled($get('group_id'))),
                Forms\Components\DatePicker::make('period')
                    ->required()
                    ->displayFormat('Y-m-d')
                    ->helperText('Use the first day of the month.'),
                Forms\Components\TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->minValue(0),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Paid',
                    ])
                    ->default('pending')
                    ->required()
                    ->live(),
                Forms\Components\DatePicker::make('paid_at')
                    ->visible(fn (Forms\Get $get): bool => $get('status') === 'paid'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('group.name')
                    ->label('Group')
                    ->sortable(),
                Tables\Columns\TextColumn::make('member.name')
                    ->label('Member')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge(),
                Tables\Columns\TextColumn::make('paid_at')
                    ->date(),
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
            'index' => Pages\ListMonthlyDeposits::route('/'),
            'create' => Pages\CreateMonthlyDeposit::route('/create'),
            'edit' => Pages\EditMonthlyDeposit::route('/{record}/edit'),
        ];
    }
}
