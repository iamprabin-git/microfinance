<x-filament-widgets::widget class="fi-wi-admin-account-card">
    <x-filament::section>
        @php($user = auth()->user())

        <x-slot name="heading">
            Your account
        </x-slot>
        <x-slot name="description">
            Profile, settings, and sign out.
        </x-slot>

        @if($user)
            <div class="flex items-center gap-4">
                <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                    @if(method_exists($user, 'profilePhotoPublicUrl') && $user->profilePhotoPublicUrl())
                        <img
                            src="{{ $user->profilePhotoPublicUrl() }}"
                            alt="{{ $user->name }}"
                            class="h-full w-full object-cover"
                        />
                    @else
                        <div class="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {{ strtoupper(mb_substr($user->name ?? 'U', 0, 1)) }}
                        </div>
                    @endif
                </div>

                <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold text-gray-950 dark:text-white">
                        {{ $user->name }}
                    </div>
                    <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                        {{ $user->email }}
                    </div>
                    @if(property_exists($user, 'role') || isset($user->role))
                        <div class="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                            Role: {{ is_object($user->role) && method_exists($user->role, 'value') ? $user->role->value : $user->role }}
                        </div>
                    @endif
                </div>
            </div>

            <div class="mt-4 grid gap-2">
                <a
                    href="{{ url('/admin/users/'.$user->id.'/edit') }}"
                    class="fi-btn relative inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-950 shadow-sm transition hover:border-primary-500/40 hover:shadow-md dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                    My profile
                </a>

                <a
                    href="{{ url('/admin/users/'.$user->id.'/edit') }}"
                    class="fi-btn relative inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-950 shadow-sm transition hover:border-primary-500/40 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                    Settings
                </a>

                <form method="post" action="{{ filament()->getLogoutUrl() }}">
                    @csrf
                    <button
                        type="submit"
                        class="fi-btn relative inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:border-rose-300 hover:shadow-md dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                    >
                        Log out
                    </button>
                </form>
            </div>
        @else
            <div class="text-sm text-gray-500 dark:text-gray-400">
                Not signed in.
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>

