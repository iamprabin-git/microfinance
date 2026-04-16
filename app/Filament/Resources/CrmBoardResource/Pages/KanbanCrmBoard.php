<?php

namespace App\Filament\Resources\CrmBoardResource\Pages;

use App\Filament\Resources\CrmBoardResource;
use App\Models\CrmBoard;
use App\Models\CrmItem;
use Filament\Actions\Action;
use Filament\Resources\Pages\Page;

class KanbanCrmBoard extends Page
{
    protected static string $resource = CrmBoardResource::class;

    protected static string $view = 'filament.resources.crm-board-resource.pages.kanban-crm-board';

    public CrmBoard $record;

    /** @var array<string, string> */
    public array $statuses = [
        'new' => 'New',
        'in_progress' => 'In progress',
        'done' => 'Done',
    ];

    public ?int $groupId = null;
    public ?int $assigneeUserId = null;

    public function mount(int|string $record): void
    {
        /** @var CrmBoard $board */
        $board = CrmBoard::query()->findOrFail($record);
        $this->record = $board;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('back')
                ->label('Back to board')
                ->url(fn () => CrmBoardResource::getUrl('edit', ['record' => $this->record])),
        ];
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function cardsByStatus(): array
    {
        $q = CrmItem::query()
            ->where('board_id', $this->record->id)
            ->with(['assignee:id,name', 'group:id,name']);

        if ($this->groupId) {
            $q->where('group_id', $this->groupId);
        }
        if ($this->assigneeUserId) {
            $q->where('assignee_user_id', $this->assigneeUserId);
        }

        $items = $q->orderByDesc('updated_at')->limit(500)->get();

        $out = [];
        foreach (array_keys($this->statuses) as $key) {
            $out[$key] = [];
        }

        foreach ($items as $item) {
            $status = $item->status ?: 'new';
            if (! array_key_exists($status, $out)) {
                $status = 'new';
            }
            $out[$status][] = [
                'id' => $item->id,
                'name' => $item->name,
                'group' => $item->group?->name,
                'assignee' => $item->assignee?->name,
                'updated_at' => $item->updated_at?->diffForHumans(),
            ];
        }

        return $out;
    }

    public function moveItem(int $itemId, string $toStatus): void
    {
        if (! array_key_exists($toStatus, $this->statuses)) {
            return;
        }

        $item = CrmItem::query()
            ->where('board_id', $this->record->id)
            ->findOrFail($itemId);

        $item->update(['status' => $toStatus]);
    }
}

