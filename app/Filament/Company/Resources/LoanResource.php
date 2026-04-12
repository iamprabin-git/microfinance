<?php

namespace App\Filament\Company\Resources;

use App\Filament\Company\Concerns\BelongsToTenantViaGroup;
use App\Filament\Company\Resources\LoanResource\Pages;
use App\Filament\Company\Resources\LoanResource\RelationManagers\RepaymentsRelationManager;
use App\Filament\Company\TenantForm;
use App\Models\Loan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class LoanResource extends Resource
{
    use BelongsToTenantViaGroup;

    protected static ?string $model = Loan::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationGroup = 'Savings & loans';

    protected static ?int $navigationSort = 4;

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
                Forms\Components\TextInput::make('principal')
                    ->required()
                    ->numeric()
                    ->minValue(0.01),
                Forms\Components\DatePicker::make('issued_at')
                    ->required()
                    ->default(now()),
                Forms\Components\DatePicker::make('due_date'),
                Forms\Components\Select::make('status')
                    ->options([
                        'active' => 'Active',
                        'closed' => 'Closed',
                    ])
                    ->default('active')
                    ->required(),
                Forms\Components\Textarea::make('notes')
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
                Tables\Columns\TextColumn::make('member.name')
                    ->label('Member')
                    ->sortable(),
                Tables\Columns\TextColumn::make('principal')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),
                Tables\Columns\TextColumn::make('issued_at')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge(),
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
            RepaymentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLoans::route('/'),
            'create' => Pages\CreateLoan::route('/create'),
            'edit' => Pages\EditLoan::route('/{record}/edit'),
        ];
    }
}
