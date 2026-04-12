<?php

namespace App\Filament\Company;

use Filament\Forms\Components\Select;
use Illuminate\Database\Eloquent\Builder;

final class TenantForm
{
    public static function groupSelect(Select $field): Select
    {
        return $field->relationship(
            'group',
            'name',
            fn (Builder $query) => $query->where(
                'company_id',
                auth()->user()->company_id
            ),
        );
    }

}
