<?php

namespace App\Observers;

use App\Models\CrmItem;
use App\Models\CrmItemActivity;

class CrmItemObserver
{
    public function created(CrmItem $item): void
    {
        CrmItemActivity::query()->create([
            'board_id' => $item->board_id,
            'item_id' => $item->id,
            'actor_user_id' => auth()->id(),
            'event' => 'created',
            'meta' => [
                'name' => $item->name,
                'status' => $item->status,
                'group_id' => $item->group_id,
                'assignee_user_id' => $item->assignee_user_id,
            ],
        ]);
    }

    public function updated(CrmItem $item): void
    {
        $dirty = array_keys($item->getDirty());
        if ($dirty === []) {
            return;
        }

        $meta = [];
        foreach ($dirty as $field) {
            $meta[$field] = [
                'from' => $item->getOriginal($field),
                'to' => $item->getAttribute($field),
            ];
        }

        $event = 'updated';
        if (in_array('status', $dirty, true)) {
            $event = 'status_changed';
        } elseif (in_array('assignee_user_id', $dirty, true)) {
            $event = 'assigned';
        } elseif (in_array('group_id', $dirty, true)) {
            $event = 'moved_group';
        }

        CrmItemActivity::query()->create([
            'board_id' => $item->board_id,
            'item_id' => $item->id,
            'actor_user_id' => auth()->id(),
            'event' => $event,
            'meta' => $meta,
        ]);
    }
}

