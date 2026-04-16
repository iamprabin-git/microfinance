<x-filament-panels::page>
    <div class="space-y-4">
        <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-[14rem]">
                <x-filament::input.wrapper>
                    <x-filament::input.select wire:model.live="groupId">
                        <option value="">All groups</option>
                        @foreach($this->record->groups()->orderBy('position')->get() as $g)
                            <option value="{{ $g->id }}">{{ $g->name }}</option>
                        @endforeach
                    </x-filament::input.select>
                </x-filament::input.wrapper>
            </div>

            <div class="min-w-[14rem]">
                <x-filament::input.wrapper>
                    <x-filament::input.select wire:model.live="assigneeUserId">
                        <option value="">All assignees</option>
                        @foreach(\App\Models\User::query()->orderBy('name')->limit(250)->get(['id','name']) as $u)
                            <option value="{{ $u->id }}">{{ $u->name }}</option>
                        @endforeach
                    </x-filament::input.select>
                </x-filament::input.wrapper>
            </div>
        </div>

        @php($byStatus = $this->cardsByStatus())

        <div class="grid gap-4 md:grid-cols-3">
            @foreach($this->statuses as $statusKey => $statusLabel)
                <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                        <div class="text-sm font-semibold">{{ $statusLabel }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            {{ count($byStatus[$statusKey] ?? []) }}
                        </div>
                    </div>
                    <div class="space-y-2 p-3">
                        @forelse(($byStatus[$statusKey] ?? []) as $card)
                            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="min-w-0">
                                        <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {{ $card['name'] }}
                                        </div>
                                        <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            @if($card['group'])
                                                <span>Group: {{ $card['group'] }}</span>
                                            @endif
                                            @if($card['assignee'])
                                                <span>Assignee: {{ $card['assignee'] }}</span>
                                            @endif
                                            @if($card['updated_at'])
                                                <span>Updated {{ $card['updated_at'] }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="shrink-0">
                                        <x-filament::dropdown placement="bottom-end">
                                            <x-slot name="trigger">
                                                <x-filament::button color="gray" size="xs">
                                                    Move
                                                </x-filament::button>
                                            </x-slot>
                                            <x-filament::dropdown.list>
                                                @foreach($this->statuses as $toKey => $toLabel)
                                                    @if($toKey !== $statusKey)
                                                        <x-filament::dropdown.list.item
                                                            wire:click="moveItem({{ $card['id'] }}, '{{ $toKey }}')"
                                                        >
                                                            {{ $toLabel }}
                                                        </x-filament::dropdown.list.item>
                                                    @endif
                                                @endforeach
                                            </x-filament::dropdown.list>
                                        </x-filament::dropdown>
                                    </div>
                                </div>
                            </div>
                        @empty
                            <div class="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                No items.
                            </div>
                        @endforelse
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</x-filament-panels::page>

