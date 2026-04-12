<?php

namespace App\Filament\Company\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToCompanyTenant
{
    public static function getEloquentQuery(): Builder
    {
        $companyId = auth()->user()?->company_id;

        return parent::getEloquentQuery()
            ->when($companyId, fn (Builder $q) => $q->where('company_id', $companyId));
    }
}
