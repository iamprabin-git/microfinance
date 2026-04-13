<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;

class AdminWelcomePanel extends Widget
{
    protected static string $view = 'filament.widgets.admin-welcome-panel';

    protected static ?int $sort = -6;

    protected int|string|array $columnSpan = 'full';

    protected static bool $isLazy = false;
}
