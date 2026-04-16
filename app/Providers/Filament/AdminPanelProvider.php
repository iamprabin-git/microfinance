<?php

namespace App\Providers\Filament;

use App\Filament\Pages\AdminDashboard;
use App\Filament\Widgets\AdminAccountCard;
use App\Filament\Widgets\AdminWelcomePanel;
use App\Filament\Widgets\PlatformOverviewStats;
use App\Http\Middleware\FilamentAuthenticate;
use Filament\Enums\ThemeMode;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\MaxWidth;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->brandName('Samuh')
            ->font('Inter')
            ->viteTheme('resources/css/filament/admin/theme.css')
            ->defaultThemeMode(ThemeMode::System)
            ->darkMode(true)
            ->colors([
                'danger' => Color::Rose,
                'gray' => Color::Slate,
                'info' => Color::Sky,
                'primary' => Color::Teal,
                'success' => Color::Emerald,
                'warning' => Color::Amber,
            ])
            ->sidebarCollapsibleOnDesktop(true)
            ->sidebarWidth('18.5rem')
            ->collapsedSidebarWidth('4.5rem')
            ->maxContentWidth(MaxWidth::SevenExtraLarge)
            ->simplePageMaxContentWidth(MaxWidth::Large)
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->pages([
                AdminDashboard::class,
            ])
            ->widgets([
                AdminWelcomePanel::class,
                PlatformOverviewStats::class,
                AdminAccountCard::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                FilamentAuthenticate::class,
            ]);
    }
}
