<?php

namespace App\Filament\Resources\CrmBoardResource\RelationManagers;

use App\Models\CrmColumn;
use App\Models\CrmGroup;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Items';

    public function form(Form $form): Form
    {
        /** @var \App\Models\CrmBoard $board */
        $board = $this->getOwnerRecord();
        $columns = $board->columns()->get();
        $groups = $board->groups()->get();

        $dynamicFields = $columns->map(function (CrmColumn $col) {
            $base = match ($col->type) {
                CrmColumn::TYPE_NUMBER => Forms\Components\TextInput::make("values.{$col->key}")
                    ->label($col->name)
                    ->numeric(),
                CrmColumn::TYPE_DATE => Forms\Components\DatePicker::make("values.{$col->key}")
                    ->label($col->name),
                CrmColumn::TYPE_STATUS => Forms\Components\Select::make("values.{$col->key}")
                    ->label($col->name)
                    ->options(array_combine(array_keys($col->options ?? []), array_keys($col->options ?? [])))
                    ->native(false),
                default => Forms\Components\TextInput::make("values.{$col->key}")
                    ->label($col->name),
            };

            if ($col->is_required) {
                $base->required();
            }

            return $base;
        })->all();

        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->label('Item name')
                ->required()
                ->maxLength(255),
            Forms\Components\Select::make('group_id')
                ->label('Group')
                ->options($groups->mapWithKeys(fn (CrmGroup $g) => [$g->id => $g->name])->all())
                ->searchable()
                ->native(false)
                ->placeholder('—'),
            Forms\Components\Select::make('assignee_user_id')
                ->label('Assignee')
                ->relationship('assignee', 'name')
                ->searchable()
                ->preload()
                ->native(false)
                ->placeholder('—'),
            Forms\Components\Select::make('status')
                ->options([
                    'new' => 'New',
                    'in_progress' => 'In progress',
                    'done' => 'Done',
                ])
                ->native(false)
                ->placeholder('—'),
            Forms\Components\Section::make('Fields')
                ->schema($dynamicFields)
                ->columns(2)
                ->collapsed(fn () => count($dynamicFields) > 6),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        /** @var \App\Models\CrmBoard $board */
        $board = $this->getOwnerRecord();
        $columns = $board->columns()->get();

        $dynamicColumns = $columns->take(6)->map(function (CrmColumn $col) {
            return Tables\Columns\TextColumn::make("values->{$col->key}")
                ->label($col->name)
                ->toggleable()
                ->wrap()
                ->limit(30);
        })->all();

        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->wrap(),
                Tables\Columns\TextColumn::make('group.name')
                    ->label('Group')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('assignee.name')
                    ->label('Assignee')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'new' => 'New',
                        'in_progress' => 'In progress',
                        'done' => 'Done',
                        default => '—',
                    })
                    ->color(fn (?string $state) => match ($state) {
                        'done' => 'success',
                        'in_progress' => 'warning',
                        'new' => 'info',
                        default => 'gray',
                    }),
                ...$dynamicColumns,
                Tables\Columns\TextColumn::make('updated_at')
                    ->since()
                    ->label('Updated')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('group_id')
                    ->label('Group')
                    ->options(fn () => $this->getOwnerRecord()
                        ->groups()
                        ->orderBy('position')
                        ->pluck('name', 'id')
                        ->all())
                    ->searchable(),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'new' => 'New',
                        'in_progress' => 'In progress',
                        'done' => 'Done',
                    ]),
                Tables\Filters\SelectFilter::make('assignee_user_id')
                    ->label('Assignee')
                    ->options(fn () => User::query()->orderBy('name')->pluck('name', 'id')->all())
                    ->searchable(),
            ]);
    }
}

