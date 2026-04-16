<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;

class AdminAccountCard extends Widget
{
    protected static string $view = 'filament.widgets.admin-account-card';

    protected static ?int $sort = -5;

    protected int|string|array $columnSpan = [
        'default' => 12,
        'lg' => 4,
    ];

    protected static bool $isLazy = false;
}

