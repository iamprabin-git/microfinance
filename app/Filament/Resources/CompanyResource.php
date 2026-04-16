<?php

namespace App\Filament\Resources;

use App\Enums\CompanyPaymentStatus;
use App\Filament\Resources\CompanyResource\Pages;
use App\Filament\Resources\CompanyResource\RelationManagers;
use App\Models\Company;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Validation\Rules\Password;

class CompanyResource extends Resource
{
    protected static ?string $model = Company::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Organization')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true),
                        Forms\Components\TextInput::make('slug')
                            ->alphaDash()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('URL-safe identifier. Leave blank to generate from name on save.'),
                        Forms\Components\Toggle::make('is_active')
                            ->helperText('Inactive companies cannot sign in to the company portal.'),
                        Forms\Components\TextInput::make('currency')
                            ->label('Reporting currency')
                            ->maxLength(8)
                            ->default(fn (): string => (string) config('app.default_currency'))
                            ->required()
                            ->helperText('Used for loans, savings, and financial statements.'),
                        Forms\Components\Textarea::make('address')
                            ->rows(3)
                            ->maxLength(2000),
                        Forms\Components\TextInput::make('contact_phone')
                            ->label('Phone')
                            ->maxLength(64),
                        Forms\Components\TextInput::make('contact_email')
                            ->label('Email')
                            ->email()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('pan_vat_number')
                            ->label('PAN / VAT number')
                            ->maxLength(64),
                        Forms\Components\TextInput::make('registration_number')
                            ->label('Registration no.')
                            ->maxLength(64),
                        Forms\Components\TextInput::make('website')
                            ->label('Website')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\FileUpload::make('logo_path')
                            ->label('Logo')
                            ->disk('public')
                            ->directory('company-logos')
                            ->image()
                            ->imageEditor()
                            ->maxSize(2048)
                            ->helperText('Shown in statement headers and exports.'),
                        Forms\Components\Textarea::make('notes')
                            ->columnSpanFull(),
                    ])->columns(2),
                Forms\Components\Section::make('First company login')
                    ->description('Creates the main company portal account (Company role). They can add staff and invite end users.')
                    ->schema([
                        Forms\Components\TextInput::make('portal_admin_name')
                            ->label('Company account name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('portal_admin_email')
                            ->label('Company account email')
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(User::class, 'email'),
                        Forms\Components\TextInput::make('portal_admin_password')
                            ->label('Temporary password')
                            ->password()
                            ->revealable()
                            ->required()
                            ->same('portal_admin_password_confirmation')
                            ->rules([Password::defaults()]),
                        Forms\Components\TextInput::make('portal_admin_password_confirmation')
                            ->label('Confirm password')
                            ->password()
                            ->revealable()
                            ->required()
                            ->dehydrated(false),
                    ])
                    ->columns(2)
                    ->hiddenOn('edit'),
                Forms\Components\Section::make('Payment & subscription')
                    ->description('Use table actions for quick approve/reject after checking the receipt, or set fields manually.')
                    ->schema([
                        Forms\Components\Select::make('payment_status')
                            ->options(collect(CompanyPaymentStatus::cases())->mapWithKeys(
                                fn (CompanyPaymentStatus $s) => [$s->value => $s->label()]
                            ))
                            ->required()
                            ->native(false),
                        Forms\Components\DateTimePicker::make('payment_reviewed_at')
                            ->seconds(false),
                        Forms\Components\Textarea::make('payment_receipt_notes')
                            ->label('Receipt / payment notes')
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
                Tables\Columns\TextColumn::make('payment_status')
                    ->badge()
                    ->formatStateUsing(fn (?CompanyPaymentStatus $state): string => $state?->label() ?? '—')
                    ->color(fn (?CompanyPaymentStatus $state): string => match ($state) {
                        CompanyPaymentStatus::Approved => 'success',
                        CompanyPaymentStatus::Rejected => 'danger',
                        CompanyPaymentStatus::Pending => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('payment_reviewed_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('users_count')
                    ->counts('users')
                    ->label('Users'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active status'),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->options(collect(CompanyPaymentStatus::cases())->mapWithKeys(
                        fn (CompanyPaymentStatus $s) => [$s->value => $s->label()]
                    )),
            ])
            ->actions([
                Tables\Actions\Action::make('approvePayment')
                    ->label('Approve payment')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalDescription('Marks payment as verified, activates the company, and allows portal login.')
                    ->action(function (Company $record): void {
                        $record->update([
                            'payment_status' => CompanyPaymentStatus::Approved,
                            'is_active' => true,
                            'payment_reviewed_at' => now(),
                        ]);
                    })
                    ->visible(fn (Company $record): bool => $record->payment_status !== CompanyPaymentStatus::Approved),
                Tables\Actions\Action::make('rejectPayment')
                    ->label('Reject / unpaid')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('Deactivates the company until payment is resolved.')
                    ->action(function (Company $record): void {
                        $record->update([
                            'payment_status' => CompanyPaymentStatus::Rejected,
                            'is_active' => false,
                            'payment_reviewed_at' => now(),
                        ]);
                    })
                    ->visible(fn (Company $record): bool => $record->payment_status !== CompanyPaymentStatus::Rejected),
                Tables\Actions\Action::make('markPaymentPending')
                    ->label('Mark pending')
                    ->icon('heroicon-o-clock')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->action(function (Company $record): void {
                        $record->update([
                            'payment_status' => CompanyPaymentStatus::Pending,
                            'payment_reviewed_at' => null,
                        ]);
                    }),
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
            RelationManagers\PortalUsersRelationManager::class,
            RelationManagers\MonthlyDepositsRelationManager::class,
            RelationManagers\LoansRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCompanies::route('/'),
            'create' => Pages\CreateCompany::route('/create'),
            'edit' => Pages\EditCompany::route('/{record}/edit'),
        ];
    }
}
