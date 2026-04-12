<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToCompanyViaGroup
{
    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->whereHas('group', fn (Builder $g) => $g->where('company_id', $companyId));
    }
}
