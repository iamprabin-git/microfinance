<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use App\Enums\UserRole;
use App\Models\ChartOfAccount;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PortalUsersRelationManager extends RelationManager
{
    protected static string $relationship = 'users';

    protected static ?string $title = 'Portal users';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->rules(['nullable', Password::defaults()])
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? Hash::make((string) $state) : null)
                    ->helperText('Leave blank when editing to keep the current password.'),
                Forms\Components\Select::make('role')
                    ->options([
                        UserRole::CompanyAdmin->value => UserRole::CompanyAdmin->label(),
                        UserRole::CompanyUser->value => UserRole::CompanyUser->label(),
                        UserRole::CompanyStaff->value => UserRole::CompanyStaff->label(),
                        UserRole::CompanyEndUser->value => UserRole::CompanyEndUser->label(),
                    ])
                    ->required()
                    ->native(false),
                Forms\Components\Select::make('chart_of_account_id')
                    ->label('Chart of account')
                    ->options(fn (): array => ChartOfAccount::query()
                        ->where('company_id', $this->getOwnerRecord()->id)
                        ->where('is_active', true)
                        ->pluck('name', 'id')
                        ->toArray()
                    )
                    ->searchable()
                    ->preload()
                    ->required(fn (\Filament\Forms\Get $get): bool => in_array($get('role'), [
                        \App\Enums\UserRole::CompanyUser->value,
                        \App\Enums\UserRole::CompanyStaff->value,
                        \App\Enums\UserRole::CompanyEndUser->value,
                    ], true)),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('role', '!=', UserRole::SuperAdmin))
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->formatStateUsing(function ($state): string {
                        $role = $state instanceof UserRole ? $state : UserRole::from((string) $state);

                        return $role->label();
                    }),
                Tables\Columns\TextColumn::make('chartOfAccount.name')
                    ->label('COA')
                    ->toggleable(),
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
