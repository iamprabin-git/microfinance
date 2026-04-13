<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use App\Enums\LoanStatus;
use App\Models\Company;
use App\Models\Loan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class LoansRelationManager extends RelationManager
{
    protected static string $relationship = 'loans';

    protected static ?string $title = 'Loans';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('member_id')
                    ->label('Member')
                    ->options(fn (): array => $this->getOwnerRecord()->members()->orderBy('name')->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                Forms\Components\TextInput::make('principal')
                    ->numeric()
                    ->required()
                    ->prefix(fn (): string => $this->companyCurrency()),
                Forms\Components\DatePicker::make('issued_at')
                    ->required()
                    ->native(false),
                Forms\Components\DatePicker::make('due_date')
                    ->native(false),
                Forms\Components\Select::make('status')
                    ->options(collect(LoanStatus::cases())->mapWithKeys(
                        fn (LoanStatus $s) => [$s->value => $s->label()]
                    ))
                    ->required()
                    ->native(false),
                Forms\Components\Textarea::make('notes')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->withSum('repayments as repaid_total', 'amount'))
            ->recordTitleAttribute('principal')
            ->columns([
                Tables\Columns\TextColumn::make('member.name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('principal')
                    ->formatStateUsing(fn ($state): string => $this->companyCurrency().' '.number_format((float) $state, 2)),
                Tables\Columns\TextColumn::make('issued_at')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('due_date')
                    ->date(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (?LoanStatus $state): string => $state?->label() ?? '—')
                    ->color(fn (?LoanStatus $state): string => match ($state) {
                        LoanStatus::Active => 'warning',
                        LoanStatus::Closed => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('repaid_total')
                    ->label('Repaid')
                    ->formatStateUsing(fn ($state): string => $this->companyCurrency().' '.number_format((float) ($state ?? 0), 2)),
            ])
            ->defaultSort('issued_at', 'desc')
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('recordRepayment')
                    ->label('Repayment')
                    ->icon('heroicon-o-banknotes')
                    ->visible(fn (Loan $record): bool => $record->status === LoanStatus::Active)
                    ->form([
                        Forms\Components\TextInput::make('amount')
                            ->numeric()
                            ->required()
                            ->prefix(fn (): string => $this->companyCurrency()),
                        Forms\Components\DatePicker::make('paid_at')
                            ->required()
                            ->default(now())
                            ->native(false),
                        Forms\Components\Textarea::make('notes'),
                    ])
                    ->action(function (array $data, Loan $record): void {
                        $record->repayments()->create([
                            'amount' => $data['amount'],
                            'paid_at' => $data['paid_at'],
                            'notes' => $data['notes'] ?? null,
                        ]);
                    }),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    private function companyCurrency(): string
    {
        /** @var Company $company */
        $company = $this->getOwnerRecord();

        return $company->currency ?? (string) config('app.default_currency');
    }
}
