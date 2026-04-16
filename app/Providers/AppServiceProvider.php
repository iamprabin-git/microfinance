<?php

namespace App\Providers;

use App\Domain\FinancialReport;
use App\Models\CrmItem;
use App\Observers\CrmItemObserver;
use App\Policies\FinancialReportPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(FinancialReport::class, FinancialReportPolicy::class);

        CrmItem::observe(CrmItemObserver::class);
    }
}
