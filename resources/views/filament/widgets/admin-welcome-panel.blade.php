<x-filament-widgets::widget class="fi-wi-admin-welcome">
    <x-filament::section>
        <x-slot name="heading">
            Samuh admin
        </x-slot>
        <x-slot name="description">
            Manage cooperatives, verify subscriptions, moderate reviews, and edit public marketing copy from one place.
        </x-slot>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
                href="{{ url('/admin/companies') }}"
                class="fi-btn group relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-start shadow-sm transition hover:border-primary-500/40 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
            >
                <span class="text-sm font-semibold text-gray-950 dark:text-white">Companies</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">Payment status, activation, loans & deposits</span>
            </a>
            <a
                href="{{ url('/admin/users') }}"
                class="fi-btn group relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-start shadow-sm transition hover:border-primary-500/40 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
            >
                <span class="text-sm font-semibold text-gray-950 dark:text-white">Users</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">Portal roles and company access</span>
            </a>
            <a
                href="{{ url('/admin/reviews') }}"
                class="fi-btn group relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-start shadow-sm transition hover:border-primary-500/40 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
            >
                <span class="text-sm font-semibold text-gray-950 dark:text-white">Reviews</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">Approve member feedback for the public site</span>
            </a>
            <a
                href="{{ url('/admin/site-contents') }}"
                class="fi-btn group relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-start shadow-sm transition hover:border-primary-500/40 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
            >
                <span class="text-sm font-semibold text-gray-950 dark:text-white">Marketing pages</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">Titles, hero images, and SEO descriptions</span>
            </a>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
