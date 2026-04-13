<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Forms\Components\TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? Hash::make($state) : null)
                    ->helperText('Leave blank when editing to keep the current password.'),
                Forms\Components\Select::make('role')
                    ->options([
                        UserRole::SuperAdmin->value => UserRole::SuperAdmin->label(),
                        UserRole::CompanyAdmin->value => UserRole::CompanyAdmin->label(),
                        UserRole::CompanyUser->value => UserRole::CompanyUser->label(),
                        UserRole::CompanyStaff->value => UserRole::CompanyStaff->label(),
                        UserRole::CompanyEndUser->value => UserRole::CompanyEndUser->label(),
                    ])
                    ->required()
                    ->live(),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload()
                    ->visible(fn (Get $get): bool => in_array($get('role'), [
                        UserRole::CompanyAdmin->value,
                        UserRole::CompanyUser->value,
                        UserRole::CompanyStaff->value,
                        UserRole::CompanyEndUser->value,
                    ], true))
                    ->required(fn (Get $get): bool => in_array($get('role'), [
                        UserRole::CompanyAdmin->value,
                        UserRole::CompanyUser->value,
                        UserRole::CompanyStaff->value,
                        UserRole::CompanyEndUser->value,
                    ], true)),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->formatStateUsing(function ($state): string {
                        $role = $state instanceof UserRole ? $state : UserRole::from((string) $state);

                        return $role->label();
                    }),
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Company')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
