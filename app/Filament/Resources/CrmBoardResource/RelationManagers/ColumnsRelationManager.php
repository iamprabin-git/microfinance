<?php

namespace App\Filament\Resources\CrmBoardResource\RelationManagers;

use App\Models\CrmColumn;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ColumnsRelationManager extends RelationManager
{
    protected static string $relationship = 'columns';

    protected static ?string $title = 'Columns';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(function (?string $state, callable $set, callable $get): void {
                    $key = (string) $get('key');
                    if ($key !== '') {
                        return;
                    }
                    if (! $state) {
                        return;
                    }
                    $set('key', Str::of($state)->snake()->toString());
                }),
            Forms\Components\TextInput::make('key')
                ->helperText('Stable identifier used to store values (snake_case).')
                ->required()
                ->maxLength(64)
                ->rules([
                    'regex:/^[a-z][a-z0-9_]*$/',
                    Rule::unique('crm_columns', 'key')->where(fn ($q) => $q->where('board_id', $this->getOwnerRecord()->id))->ignore($this->getRecord()?->id),
                ]),
            Forms\Components\Select::make('type')
                ->options([
                    CrmColumn::TYPE_TEXT => 'Text',
                    CrmColumn::TYPE_NUMBER => 'Number',
                    CrmColumn::TYPE_DATE => 'Date',
                    CrmColumn::TYPE_STATUS => 'Status',
                ])
                ->required()
                ->native(false),
            Forms\Components\KeyValue::make('options')
                ->label('Options (for Status)')
                ->helperText('For status columns, add label → color, e.g. New → blue.')
                ->reorderable()
                ->columnSpanFull()
                ->visible(fn (callable $get) => $get('type') === CrmColumn::TYPE_STATUS),
            Forms\Components\TextInput::make('position')
                ->numeric()
                ->minValue(0)
                ->default(0),
            Forms\Components\Toggle::make('is_required')
                ->default(false),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('position')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('key')
                    ->badge()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_required')
                    ->boolean()
                    ->label('Required'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('position');
    }
}

