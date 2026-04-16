<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmBoard extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function columns(): HasMany
    {
        return $this->hasMany(CrmColumn::class, 'board_id')->orderBy('position');
    }

    public function groups(): HasMany
    {
        return $this->hasMany(CrmGroup::class, 'board_id')->orderBy('position');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CrmItem::class, 'board_id')->orderByDesc('id');
    }
}

