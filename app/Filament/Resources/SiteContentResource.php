<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SiteContentResource\Pages;
use App\Models\SiteContent;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SiteContentResource extends Resource
{
    protected static ?string $model = SiteContent::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Website';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Pages & content';

    protected static ?string $modelLabel = 'page';

    public static function form(Form $form): Form
    {
        $slugLabels = [
            'home' => 'Homepage',
            'about' => 'About',
            'contact' => 'Contact',
            'prices' => 'Pricing',
        ];

        return $form
            ->schema([
                Forms\Components\Select::make('slug')
                    ->label('Page')
                    ->options(collect(SiteContent::slugs())->mapWithKeys(
                        fn (string $slug) => [$slug => $slugLabels[$slug] ?? $slug]
                    ))
                    ->required()
                    ->disabledOn('edit')
                    ->dehydrated()
                    ->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('subtitle')
                    ->maxLength(255),
                Forms\Components\Textarea::make('body')
                    ->rows(16)
                    ->columnSpanFull()
                    ->helperText('Shown on the public site. Line breaks are preserved.'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable(),
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
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSiteContents::route('/'),
            'create' => Pages\CreateSiteContent::route('/create'),
            'edit' => Pages\EditSiteContent::route('/{record}/edit'),
        ];
    }
}
