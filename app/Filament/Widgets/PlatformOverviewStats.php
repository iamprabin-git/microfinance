<?php

namespace App\Filament\Widgets;

use App\Models\Company;
use App\Models\Review;
use App\Models\SiteContent;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Schema;

class PlatformOverviewStats extends BaseWidget
{
    protected static ?int $sort = -5;

    protected int|string|array $columnSpan = 'full';

    protected ?string $heading = 'Platform snapshot';

    protected ?string $description = 'Live counts across companies, users, reviews, and published marketing pages.';

    /**
     * @return array<Stat>
     */
    protected function getStats(): array
    {
        if (! Schema::hasTable('companies')) {
            return [
                Stat::make('Status', 'Database not migrated')->color('gray'),
            ];
        }

        $companies = Company::query()->count();
        $activeCompanies = Company::query()->where('is_active', true)->count();
        $portalUsers = Schema::hasTable('users')
            ? User::query()->whereNotNull('company_id')->count()
            : 0;
        $pendingReviews = Schema::hasTable('reviews')
            ? Review::query()->where('is_approved', false)->count()
            : 0;
        $pages = Schema::hasTable('site_contents')
            ? SiteContent::query()->count()
            : 0;

        return [
            Stat::make('Companies', (string) $companies)
                ->description($activeCompanies.' active')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('primary')
                ->icon('heroicon-o-building-office-2')
                ->url(url('/admin/companies')),
            Stat::make('Portal users', (string) $portalUsers)
                ->description('With a company assignment')
                ->color('success')
                ->icon('heroicon-o-users')
                ->url(url('/admin/users')),
            Stat::make('Reviews pending', (string) $pendingReviews)
                ->description('Awaiting approval')
                ->color($pendingReviews > 0 ? 'warning' : 'gray')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->url(url('/admin/reviews')),
            Stat::make('Marketing pages', (string) $pages)
                ->description('Home, about, pricing…')
                ->color('info')
                ->icon('heroicon-o-document-text')
                ->url(url('/admin/site-contents')),
        ];
    }
}
