<?php

namespace App\Filament\Resources\GroupResource\RelationManagers;

use App\Enums\DepositStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Carbon;

class MonthlyDepositsRelationManager extends RelationManager
{
    protected static string $relationship = 'monthlyDeposits';

    protected static ?string $title = 'Monthly savings';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('member_id')
                    ->label('Member')
                    ->options(fn (): array => $this->getOwnerRecord()->members()->orderBy('name')->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                Forms\Components\DatePicker::make('period')
                    ->label('Period (calendar month)')
                    ->required()
                    ->displayFormat('M Y')
                    ->native(false),
                Forms\Components\TextInput::make('amount')
                    ->numeric()
                    ->required()
                    ->prefix(fn (): string => $this->getOwnerRecord()->currency),
                Forms\Components\Select::make('status')
                    ->options(collect(DepositStatus::cases())->mapWithKeys(
                        fn (DepositStatus $s) => [$s->value => $s->label()]
                    ))
                    ->required()
                    ->native(false),
                Forms\Components\DatePicker::make('paid_at')
                    ->native(false)
                    ->visible(fn (Forms\Get $get): bool => $get('status') === DepositStatus::Paid->value),
            ]);
    }

    public function table(Table $table): Table
    {
        $normalize = function (array $data): array {
            if (isset($data['period'])) {
                $data['period'] = Carbon::parse($data['period'])->startOfMonth()->toDateString();
            }
            if (($data['status'] ?? null) === DepositStatus::Paid->value && empty($data['paid_at'])) {
                $data['paid_at'] = now()->toDateString();
            }
            if (($data['status'] ?? null) === DepositStatus::Pending->value) {
                $data['paid_at'] = null;
            }

            return $data;
        };

        return $table
            ->recordTitleAttribute('period')
            ->columns([
                Tables\Columns\TextColumn::make('member.name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('period')
                    ->date('M Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->formatStateUsing(fn ($state, $record): string => $record->group->currency.' '.number_format((float) $state, 2)),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (?DepositStatus $state): string => $state?->label() ?? '—')
                    ->color(fn (?DepositStatus $state): string => match ($state) {
                        DepositStatus::Paid => 'success',
                        DepositStatus::Pending => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('paid_at')
                    ->date()
                    ->toggleable(),
            ])
            ->defaultSort('period', 'desc')
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->mutateFormDataUsing($normalize),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->mutateFormDataUsing($normalize),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
